import { socket } from "@/lib/socket";
import { useFocusEffect } from "@react-navigation/native";
import axios from "axios";
import Colors from "@/constants/Colors";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  PanResponder,
  PanResponderInstance,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelectedDate } from "@/context/selectedContext";
import SampleModal from "./sampleModal";
import { router } from "expo-router";

const ROW_HEIGHT = 60;
const SLOT_HEIGHT = ROW_HEIGHT / 2; // 30 mins
const LONG_PRESS_DELAY = 500;
const TAP_THRESHOLD = 5;
const HANDLE_SIZE = 10;
const EDGE_HIT_HEIGHT = 12;
const CORNER_HIT_SIZE = 24;

export type EventType = {
  id: string;
  title: string;
  start: string;
  end: string;
  location?: string;
  description?: string;
  allDay?: boolean;
  startSlot: number;
  endSlot: number;
  color?: string;
  dayIndex: number;
};

const Day = () => {
  const { selectedDate: date, setSelectedDate } = useSelectedDate();

  useEffect(() => {
    if (!date) {
      const today = new Date();
      setSelectedDate(today.toISOString());
    }
  }, []);
  // console.log(date, "selectedDateselectedDateselectedDate");

  const formattedDate = new Date(date).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  const [editableEventId, setEditableEventId] = React.useState<string | null>(
    null,
  );

  const [events, setEvents] = React.useState<EventType[]>([]);
  const [dailyEvents, setDailyEvents] = React.useState<any[]>([]);
  const [selection, setSelection] = React.useState<{
    slotIndex: number;
    start: string;
    end: string;
  } | null>(null);

  // console.log(events, "events===========");
  const [editorOpen, setEditorOpen] = React.useState(false);
  const [editorParams, setEditorParams] = React.useState<{
    eventId?: string;
    date?: string;
    start?: string;
    end?: string;
  } | null>(null);

  const panRefs = useRef<
    Record<
      string,
      {
        top: Animated.Value;
        height: Animated.Value;
      }
    >
  >({});
  const panResponders = useRef<Record<string, PanResponderInstance>>({});

  /* ---------- TIME HELPERS ---------- */
  const slotIndexToTime = (index: number) => {
    const minutes = index * 30;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  };

  const dateWithSlotToUTC = (date: string, slotIndex: number) => {
    const d = new Date(date); // local midnight
    const localHours = Math.floor((slotIndex * 30) / 60);
    const localMinutes = (slotIndex * 30) % 60;

    d.setHours(localHours, localMinutes, 0, 0);

    return d.toISOString(); // backend expects UTC
  };

  const format24h = (date: Date) =>
    date.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

  const fetchEventsByDay = async () => {
    if (!date) return;

    try {
      const d = new Date(date);
      const year = d.getFullYear();
      const month = d.getMonth() + 1;
      const day = d.getDate();

      const res = await axios.get(
        `http://192.168.1.167:5000/api/events/getEventsByDay`,
        { params: { year, month, day } },
      );
      // console.log(res, "response from the api==========");
      const mappedEvents: EventType[] = res.data.map((e: any) => {
        const startDate = new Date(e.startTime); // automatically local
        const endDate = new Date(e.endTime);

        // Calculate slot index using local hours/minutes
        const startSlot = Math.floor(
          (startDate.getHours() * 60 + startDate.getMinutes()) / 30,
        );
        const endSlot = Math.ceil(
          (endDate.getHours() * 60 + endDate.getMinutes()) / 30,
        );

        return {
          id: e._id,
          title: e.title,
          startSlot,
          endSlot,
          start: format24h(startDate),
          end: format24h(endDate),
          color: e.color || "#1a73e8",
        };
      });

      setEvents(mappedEvents);
    } catch (err) {
      console.log("Failed to fetch events for day:", err);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchEventsByDay(); // initial fetch

      const onEventCreated = (e: any) => {
        const startDate = new Date(e.startTime);
        const endDate = new Date(e.endTime);
        const d = new Date(date);

        if (
          startDate.getDate() !== d.getDate() ||
          startDate.getMonth() !== d.getMonth() ||
          startDate.getFullYear() !== d.getFullYear()
        )
          return;

        const startSlot = Math.floor(
          (startDate.getHours() * 60 + startDate.getMinutes()) / 30,
        );
        const endSlot = Math.floor(
          (endDate.getHours() * 60 + endDate.getMinutes()) / 30,
        );

        const newEvent: EventType = {
          id: e._id,
          title: e.title,
          startSlot,
          endSlot,
          start: slotIndexToTime(startSlot),
          end: slotIndexToTime(endSlot),
          color: "#1a73e8",
        };

        setEvents((prev) =>
          prev.some((p) => p.id === e._id) ? prev : [...prev, newEvent],
        );

        setSelection(null); // clear selection after create
      };

      const onEventUpdated = (updatedEvent: any) => {
        const startDate = new Date(updatedEvent.startTime);
        const endDate = new Date(updatedEvent.endTime);
        const d = new Date(date);

        if (
          startDate.getDate() !== d.getDate() ||
          startDate.getMonth() !== d.getMonth() ||
          startDate.getFullYear() !== d.getFullYear()
        )
          return;

        const startSlot = Math.floor(
          (startDate.getHours() * 60 + startDate.getMinutes()) / 30,
        );
        const endSlot = Math.floor(
          (endDate.getHours() * 60 + endDate.getMinutes()) / 30,
        );

        setEvents((prev) =>
          prev.map((e) =>
            e.id === updatedEvent._id
              ? {
                ...e,
                startSlot,
                endSlot,
                start: slotIndexToTime(startSlot),
                end: slotIndexToTime(endSlot),
              }
              : e,
          ),
        );
      };

      const onEventDeleted = ({ id }: { id: string }) => {
        setEvents((prev) => prev.filter((e) => e.id !== id));
      };

      socket.on("eventCreated", onEventCreated);
      socket.on("eventUpdated", onEventUpdated);
      socket.on("eventDeleted", onEventDeleted);

      return () => {
        socket.off("eventCreated", onEventCreated);
        socket.off("eventUpdated", onEventUpdated);
        socket.off("eventDeleted", onEventDeleted);
        setSelection(null);
      };
    }, [date]),
  );

  useEffect(() => {
    events.forEach((event) => {
      if (!panRefs.current[event.id]) {
        panRefs.current[event.id] = {
          top: new Animated.Value(event.startSlot * SLOT_HEIGHT),
          height: new Animated.Value(
            (event.endSlot - event.startSlot) * SLOT_HEIGHT,
          ),
        };
      }
    });
  }, [events]);

  useEffect(() => {
    const fetchDates = async () => {
      if (!date) return;

      try {
        const d = new Date(date);
        const year = d.getFullYear();
        const month = d.getMonth() + 1;
        const day = d.getDate();

        const res = await axios.get(
          `http://192.168.1.167:5000/api/events/getEventsByDay`,
          { params: { year, month, day } },
        );

        const apiEvents = res.data; // your array of 6 objects

        // Map API response to EventType for rendering
        const mappedEvents: EventType[] = apiEvents.map((e: any) => {
          const startDate = new Date(e.startTime);
          const endDate = new Date(e.endTime);

          // Convert to local hours and minutes
          const localStartHours = startDate.getHours();
          const localStartMinutes = startDate.getMinutes();
          const localEndHours = endDate.getHours();
          const localEndMinutes = endDate.getMinutes();

          const startSlot = Math.floor(
            (localStartHours * 60 + localStartMinutes) / 30,
          );
          const endSlot = Math.ceil(
            (localEndHours * 60 + localEndMinutes) / 30,
          );

          return {
            id: e._id,
            title: e.title,
            startSlot,
            endSlot,
            start: format24h(startDate),
            end: format24h(endDate),
            color: "#1a73e8",
          };
        });

        setEvents(mappedEvents); // ✅ store in events for rendering
        // console.log("Mapped Events for calendar:", mappedEvents);
      } catch (error) {
        console.log("Fetch events error:", error);
      }
    };

    fetchDates();
  }, [date]);

  const createPanResponder = (event: EventType) => {
    let dragging = false;
    let longPressTriggered = false;
    let timer: any;
    let startTop = 0;

    let startX = 0;
    let startY = 0;

    const anim = panRefs.current[event.id];
    const durationSlots = event.endSlot - event.startSlot;

    return PanResponder.create({
      onStartShouldSetPanResponder: () => true,

      onPanResponderGrant: (e) => {
        dragging = false;
        longPressTriggered = false;

        startX = e.nativeEvent.pageX;
        startY = e.nativeEvent.pageY;

        anim.top.stopAnimation((value: number) => {
          startTop = value;
        });

        timer = setTimeout(() => {
          if (editableEventId === event.id) {
            longPressTriggered = true;
            dragging = true;
          }
        }, LONG_PRESS_DELAY);
      },

      onPanResponderMove: (_, g) => {
        const moved =
          Math.abs(g.dx) > TAP_THRESHOLD || Math.abs(g.dy) > TAP_THRESHOLD;

        if (moved && !longPressTriggered) {
          clearTimeout(timer);
        }

        if (!dragging) return;

        const newTop = Math.max(
          0,
          Math.min((48 - durationSlots) * SLOT_HEIGHT, startTop + g.dy),
        );

        anim.top.setValue(newTop);
      },

      onPanResponderRelease: (_, g) => {
        clearTimeout(timer);

        const moved =
          Math.abs(g.dx) > TAP_THRESHOLD || Math.abs(g.dy) > TAP_THRESHOLD;

        if (!dragging && !moved) {
          setEditableEventId(event.id);
          setEditorParams({
            eventId: event.id,
            date,
            start: event.start,
            end: event.end,
          });
          setEditorOpen(true);
          return;
        }

        if (!dragging) return;

        let finalTop = 0;
        anim.top.stopAnimation((v) => (finalTop = v));

        const snappedSlot = Math.max(
          0,
          Math.min(47 - durationSlots, Math.round(finalTop / SLOT_HEIGHT)),
        );

        const snappedTop = snappedSlot * SLOT_HEIGHT;

        // ✅ UPDATE STATE (NO animation here)
        setEvents((prev) =>
          prev.map((e) =>
            e.id === event.id
              ? {
                ...e,
                startSlot: snappedSlot,
                endSlot: snappedSlot + durationSlots,
                start: slotIndexToTime(snappedSlot),
                end: slotIndexToTime(snappedSlot + durationSlots),
              }
              : e,
          ),
        );

        socket.emit("updateEvent", {
          eventId: event.id,
          startTime: dateWithSlotToUTC(date, snappedSlot),
          endTime: dateWithSlotToUTC(date, snappedSlot + durationSlots),
          allDay: false,
        });
      },
    });
  };

  const createCornerResizeResponder = (
    event: EventType,
    corner: "topLeft" | "bottomRight",
  ) => {
    const minHeight = SLOT_HEIGHT;
    const anim = panRefs.current[event.id];

    let startTop = 0;
    let startHeight = 0;

    return PanResponder.create({
      onStartShouldSetPanResponder: () => editableEventId === event.id,

      onPanResponderGrant: () => {
        anim.top.stopAnimation((v) => (startTop = v));
        anim.height.stopAnimation((v) => (startHeight = v));
      },

      onPanResponderMove: (_, g) => {
        if (corner === "topLeft") {
          const newTop = Math.max(0, startTop + g.dy);
          const newHeight = Math.max(minHeight, startHeight - g.dy);

          anim.top.setValue(newTop);
          anim.height.setValue(newHeight);
        } else {
          const newHeight = Math.max(minHeight, startHeight + g.dy);
          anim.height.setValue(newHeight);
        }
      },

      onPanResponderRelease: () => {
        let finalTop = 0;
        let finalHeight = 0;

        anim.top.stopAnimation((v) => (finalTop = v));
        anim.height.stopAnimation((v) => (finalHeight = v));

        const startSlot = Math.round(finalTop / SLOT_HEIGHT);
        const durationSlots = Math.round(finalHeight / SLOT_HEIGHT);
        const endSlot = startSlot + durationSlots;

        Animated.parallel([
          Animated.timing(anim.top, {
            toValue: startSlot * SLOT_HEIGHT,
            duration: 120,
            useNativeDriver: false,
          }),
          Animated.timing(anim.height, {
            toValue: durationSlots * SLOT_HEIGHT,
            duration: 120,
            useNativeDriver: false,
          }),
        ]).start();

        setEvents((prev) =>
          prev.map((e) =>
            e.id === event.id
              ? {
                ...e,
                startSlot,
                endSlot,
                start: slotIndexToTime(startSlot),
                end: slotIndexToTime(endSlot),
              }
              : e,
          ),
        );

        socket.emit("updateEvent", {
          eventId: event.id,
          startTime: dateWithSlotToUTC(date, startSlot),
          endTime: dateWithSlotToUTC(date, endSlot),
          allDay: false,
        });
      },
    });
  };

  /* ---------- SELECTION ---------- */
  const handleSlotPress = (slotIndex: number) => {
    setEditableEventId(null);

    setSelection({
      slotIndex,
      start: slotIndexToTime(slotIndex),
      end: slotIndexToTime(slotIndex + 1),
    });
  };

  const goToCreateEvent = () => {
    if (!selection || !date) return;

    router.push({
      pathname: "/(modal)/createEvent",
      params: {
        date,
        start: selection.start,
        end: selection.end,
        mode: "quick",
      },
    });

    setSelection(null);
  };

  const brightenColor = (hex: string, amount = 40) => {
    const num = parseInt(hex.replace("#", ""), 16);
    const r = Math.min(255, (num >> 16) + amount);
    const g = Math.min(255, ((num >> 8) & 0xff) + amount);
    const b = Math.min(255, (num & 0xff) + amount);
    return `rgb(${r}, ${g}, ${b})`;
  };

  /* ---------- UI ---------- */
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.date}>{formattedDate}</Text>
      </View>

      <ScrollView>
        <View style={{ position: "relative" }}>
          {events.map((event) => {
            // ✅ Ensure Animated.Value always exists
            if (!panRefs.current[event.id]) {
              panRefs.current[event.id] = {
                top: new Animated.Value(event.startSlot * SLOT_HEIGHT),
                height: new Animated.Value(
                  (event.endSlot - event.startSlot) * SLOT_HEIGHT,
                ),
              };
            }

            const durationSlots = event.endSlot - event.startSlot;
            panResponders.current[event.id] = createPanResponder(event);

            const pan = panResponders.current[event.id];

            const topLeftResize = createCornerResizeResponder(event, "topLeft");
            const bottomRightResize = createCornerResizeResponder(
              event,
              "bottomRight",
            );

            return (
              <Animated.View
                {...pan.panHandlers}
                style={[
                  styles.eventBlock,
                  {
                    top: panRefs.current[event.id].top,
                    height: panRefs.current[event.id].height,
                    backgroundColor: Colors.light.primary, // or Colors.dark.primary if you use dark theme

                    borderWidth: editableEventId === event.id ? 2 : 0,
                    borderColor:
                      editableEventId === event.id
                        ? brightenColor(Colors.light.primary, 50) // lighter than block
                        : "transparent",

                    // subtle glow (Android)
                    elevation: editableEventId === event.id ? 6 : 0,

                    // subtle glow (iOS)
                    shadowColor:
                      editableEventId === event.id
                        ? brightenColor(Colors.light.primary, 80)
                        : "transparent",
                    shadowOpacity: editableEventId === event.id ? 0.4 : 0,
                    shadowRadius: editableEventId === event.id ? 6 : 0,
                    shadowOffset: { width: 0, height: 0 },
                  },
                ]}
              >
                {/* TOP EDGE HIT ZONE */}
                <View
                  {...topLeftResize.panHandlers}
                  style={styles.topLeftCorner}
                />

                {/* Visual dot only */}
                {editableEventId === event.id && (
                  <>
                    <View style={[styles.resizeDot, styles.topDot]} />
                  </>
                )}

                <Text style={styles.eventTime}>
                  {slotIndexToTime(event.startSlot)} –{" "}
                  {slotIndexToTime(event.endSlot)}
                </Text>

                <Text style={styles.eventTitle}>{event.title}</Text>

                {/* Visual dot only */}
                {editableEventId === event.id && (
                  <>
                    <View style={[styles.resizeDot, styles.bottomDot]} />
                  </>
                )}

                {/* BOTTOM EDGE HIT ZONE */}
                <View
                  {...bottomRightResize.panHandlers}
                  style={styles.bottomRightCorner}
                />
              </Animated.View>
            );
          })}

          {selection && (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={goToCreateEvent}
              style={[
                styles.selectionBlock,
                { top: selection.slotIndex * SLOT_HEIGHT },
              ]}
            >
              <Text style={styles.eventText}>
                {selection.start} – {selection.end}
              </Text>
            </TouchableOpacity>
          )}

          {Array.from({ length: 48 }).map((_, slotIndex) => {
            const hour = Math.floor(slotIndex / 2);
            const minute = slotIndex % 2 === 0 ? 0 : 30;
            const label =
              minute === 0
                ? `${hour % 12 || 12} ${hour < 12 ? "AM" : "PM"}`
                : "";

            return (
              <TouchableOpacity
                key={slotIndex}
                onPress={() => handleSlotPress(slotIndex)}
              >
                <View style={[styles.row, { height: SLOT_HEIGHT }]}>
                  <Text style={styles.time}>{label}</Text>
                  <View style={styles.gridSlot} />
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
      {editorOpen && (
        <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
          <SampleModal
            event={events.find((e) => e.id === editorParams?.eventId)} // Pass the full event
            onClose={() => {
              setEditorOpen(false);
              setEditorParams(null);
              setEditableEventId(null);
            }}
            onUpdateEvent={(updatedEvent: EventType) => {
              setEvents((prev) =>
                prev.map((e) =>
                  e.id === updatedEvent.id ? { ...e, ...updatedEvent } : e,
                ),
              );

              // Update Animated values
              const anim = panRefs.current[updatedEvent.id];
              if (anim) {
                const newTop = updatedEvent.startSlot * SLOT_HEIGHT;
                const newHeight =
                  (updatedEvent.endSlot - updatedEvent.startSlot) * SLOT_HEIGHT;

                Animated.parallel([
                  Animated.timing(anim.top, {
                    toValue: newTop,
                    duration: 150,
                    useNativeDriver: false,
                  }),
                  Animated.timing(anim.height, {
                    toValue: newHeight,
                    duration: 150,
                    useNativeDriver: false,
                  }),
                ]).start();
              }
            }}
          />
        </View>
      )}
    </SafeAreaView>
  );
};

export default Day;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" }, // light background

  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  date: { color: "#000", fontSize: 18, fontWeight: "600" },

  row: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },

  time: {
    width: 60,
    textAlign: "right",
    paddingRight: 8,
    fontSize: 11,
    color: "#555",
  },

  gridSlot: { flex: 1, backgroundColor: "#f9f9f9" },

  eventBlock: {
    position: "absolute",
    left: 60,
    right: 8,
    borderRadius: 6,
    padding: 4,
    justifyContent: "center",
    zIndex: 15,
    backgroundColor: "#d1e9ff", // light event placeholder
  },

  eventTitle: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },

  eventTime: {
    color: "#fff",
    fontSize: 10,
  },

  selectionBlock: {
    position: "absolute",
    left: 60,
    right: 8,
    height: SLOT_HEIGHT,
    borderWidth: 2,
    borderColor: Colors.light.primary, // highlight color
    borderRadius: 4,
    justifyContent: "center",
    paddingHorizontal: 6,
    zIndex: 25,
    backgroundColor: "rgba(61,153,255,0.15)", // optional: slightly transparent
  },

  eventText: { color: "#000", fontSize: 12 },

  resizeHandle: {
    position: "absolute",
    width: HANDLE_SIZE,
    height: HANDLE_SIZE,
    borderRadius: HANDLE_SIZE / 2,
    backgroundColor: "#000",
    alignSelf: "center",
    zIndex: 30,
  },

  topHandle: {
    top: -HANDLE_SIZE / 2,
  },

  bottomHandle: {
    bottom: -HANDLE_SIZE / 2,
  },

  topEdge: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: EDGE_HIT_HEIGHT,
    zIndex: 50,
  },

  bottomEdge: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: EDGE_HIT_HEIGHT,
    zIndex: 50,
  },

  topLeftCorner: {
    position: "absolute",
    top: 0,
    left: 0,
    width: CORNER_HIT_SIZE,
    height: CORNER_HIT_SIZE,
    zIndex: 50,
  },

  bottomRightCorner: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: CORNER_HIT_SIZE,
    height: CORNER_HIT_SIZE,
    zIndex: 50,
  },

  resizeDot: {
    position: "absolute",
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#000",
    zIndex: 40,
  },

  topDot: {
    top: -3, // half of dot size → sits on border
    left: -3,
  },

  bottomDot: {
    bottom: -3,
    right: -3,
  },
});
