import Colors from "@/constants/Colors";
import { useSelectedDate } from "@/context/selectedContext";
import { socket } from "@/lib/socket";
import { useFocusEffect } from "@react-navigation/native";
import axios from "axios";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  PanResponder,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import SampleModal from "./sampleModal";

/* ---------- CONSTANTS ---------- */
const ROW_HEIGHT = 60;
const SLOT_HEIGHT = ROW_HEIGHT / 2; // 30 mins
const LONG_PRESS_DELAY = 1000;

const SCREEN_WIDTH = Dimensions.get("window").width;
const TIME_COL_WIDTH = 50;
const DAY_COLUMN_WIDTH = (SCREEN_WIDTH - TIME_COL_WIDTH - 15) / 7;
const CALENDAR_SHIFT_LEFT = 6;

/* ---------- TYPES ---------- */
type EventType = {
  id: string;
  title: string;
  startSlot: number;
  endSlot: number;
  color?: string;
  dayIndex: number;
};

/* ---------- UTILS ---------- */
/* ---------- UTILS ---------- */
// Returns 7 days of the week starting Monday for a given date
const getWeekDays = (dateStr: string) => {
  const base = new Date(dateStr);
  const dayOfWeek = base.getDay(); // 0=Sunday, 1=Monday, ..., 6=Saturday

  // Calculate Monday offset
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

  const monday = new Date(base);
  monday.setDate(base.getDate() + mondayOffset);

  // Generate array of 7 days starting from Monday
  return Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
};

const slotToTime = (slot: number) => {
  const mins = slot * 30;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
};

/* ======================================================= */
/* ===================== WEEK VIEW ======================= */
/* ======================================================= */
export default function WeekCalendar() {
  const { selectedDate, setSelectedDate } = useSelectedDate();
  const [editingEvent, setEditingEvent] = useState<EventType | null>(null);
  const [activeEventId, setActiveEventId] = useState<string | null>(null);

  const activeEventIdRef = useRef<string | null>(null);

  useEffect(() => {
    activeEventIdRef.current = activeEventId;
  }, [activeEventId]);

  useEffect(() => {
    if (!selectedDate) {
      setSelectedDate(new Date().toISOString());
    }
  }, []);

  // console.log(selectedDate, "selected date??????????????????????????????");
  const days = getWeekDays(selectedDate || new Date().toISOString());
  // console.log(days, "days on week");
  const [events, setEvents] = useState<EventType[]>([]);
  const [selection, setSelection] = useState<{
    slotIndex: number;
    dayIndex: number;
  } | null>(null);

  useFocusEffect(
    React.useCallback(() => {
      return () => setSelection(null);
    }, []),
  );

  useEffect(() => {
    if (!editingEvent) return;

    const liveEvent = events.find((e) => e.id === editingEvent.id);
    if (liveEvent) setEditingEvent(liveEvent);
  }, [events]);

  /* ---------- FETCH EVENTS FOR WEEK ---------- */
  const fetchEventsByWeek = async () => {
    if (!selectedDate) return;

    try {
      const weekDays = getWeekDays(selectedDate);

      const results = await Promise.all(
        weekDays.map(async (d, dayIndex) => {
          const year = d.getFullYear();
          const month = d.getMonth() + 1;
          const day = d.getDate();

          const res = await axios.get(
            "http://192.168.1.167:5000/api/events/getEventsByDay",
            { params: { year, month, day } },
          );

          return res.data.map((e: any) => {
            const startDate = new Date(e.startTime);
            const endDate = new Date(e.endTime);

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
              color: e.color || Colors.light.primary,
              dayIndex,
            };
          });
        }),
      );

      const flatEvents = results.flat();
      setEvents(flatEvents);

      // Initialize panRefs & panResponders
      flatEvents.forEach((e) => {
        if (!panRefs.current[e.id]) {
          panRefs.current[e.id] = new Animated.ValueXY({
            x: TIME_COL_WIDTH + e.dayIndex * DAY_COLUMN_WIDTH,
            y: e.startSlot * SLOT_HEIGHT,
          });
          heightRefs.current[e.id] = new Animated.Value(
            (e.endSlot - e.startSlot) * SLOT_HEIGHT,
          );
        }
        if (!panResponders.current[e.id]) {
          panResponders.current[e.id] = createPanResponder(e);
        }
      });
    } catch (err) {
      console.log("Failed to fetch events for week:", err);
    }
  };

  /* ---------- SOCKET HANDLERS ---------- */
  useFocusEffect(
    React.useCallback(() => {
      fetchEventsByWeek(); // initial fetch

      const weekDays = getWeekDays(selectedDate);

      const onEventCreated = (e: any) => {
        const startDate = new Date(e.startTime);
        const endDate = new Date(e.endTime);

        const dayIndex = weekDays.findIndex(
          (d) =>
            d.getFullYear() === startDate.getFullYear() &&
            d.getMonth() === startDate.getMonth() &&
            d.getDate() === startDate.getDate(),
        );

        if (dayIndex === -1) return;

        const startSlot = Math.floor(
          (startDate.getHours() * 60 + startDate.getMinutes()) / 30,
        );
        const endSlot = Math.ceil(
          (endDate.getHours() * 60 + endDate.getMinutes()) / 30,
        );

        const newEvent: EventType = {
          id: e._id,
          title: e.title,
          startSlot,
          endSlot,
          color: e.color || Colors.light.primary,
          dayIndex,
        };

        setEvents((prev) =>
          prev.some((p) => p.id === e._id) ? prev : [...prev, newEvent],
        );
        setSelection(null); // clear selection after create
      };

      const onEventUpdated = (updatedEvent: any) => {
        const startDate = new Date(updatedEvent.startTime);
        const endDate = new Date(updatedEvent.endTime);

        // Find the new day index in current week
        const weekDays = getWeekDays(selectedDate);
        const dayIndex = weekDays.findIndex(
          (d) =>
            d.getFullYear() === startDate.getFullYear() &&
            d.getMonth() === startDate.getMonth() &&
            d.getDate() === startDate.getDate(),
        );

        setEvents((prev) => {
          // Check if event exists already
          const exists = prev.find((e) => e.id === updatedEvent._id);

          if (dayIndex === -1) {
            // Event is no longer in this week: remove it
            return prev.filter((e) => e.id !== updatedEvent._id);
          }

          const startSlot = Math.floor(
            (startDate.getHours() * 60 + startDate.getMinutes()) / 30,
          );
          const endSlot = Math.ceil(
            (endDate.getHours() * 60 + endDate.getMinutes()) / 30,
          );

          if (exists) {
            // Update existing event
            return prev.map((e) =>
              e.id === updatedEvent._id
                ? {
                  ...e,
                  startSlot,
                  endSlot,
                  dayIndex,
                  title: updatedEvent.title,
                  color: updatedEvent.color || Colors.light.primary,
                }
                : e,
            );
          } else {
            // Event was added to this week: insert it
            return [
              ...prev,
              {
                id: updatedEvent._id,
                title: updatedEvent.title,
                startSlot,
                endSlot,
                dayIndex,
                color: updatedEvent.color || Colors.light.primary,
              },
            ];
          }
        });

        // Ensure panRefs and panResponders are created for moved/new event
        if (dayIndex !== -1) {
          if (!panRefs.current[updatedEvent._id]) {
            panRefs.current[updatedEvent._id] = new Animated.ValueXY({
              x: TIME_COL_WIDTH + dayIndex * DAY_COLUMN_WIDTH,
              y:
                Math.floor(
                  (startDate.getHours() * 60 + startDate.getMinutes()) / 30,
                ) * SLOT_HEIGHT,
            });
          }
          if (!panResponders.current[updatedEvent._id]) {
            panResponders.current[updatedEvent._id] = createPanResponder({
              id: updatedEvent._id,
              title: updatedEvent.title,
              startSlot: Math.floor(
                (startDate.getHours() * 60 + startDate.getMinutes()) / 30,
              ),
              endSlot: Math.ceil(
                (endDate.getHours() * 60 + endDate.getMinutes()) / 30,
              ),
              color: updatedEvent.color || Colors.light.primary,
              dayIndex,
            });
          } else {
            // Animate moved event
            Animated.spring(panRefs.current[updatedEvent._id], {
              toValue: {
                x: TIME_COL_WIDTH + dayIndex * DAY_COLUMN_WIDTH,
                y:
                  Math.floor(
                    (startDate.getHours() * 60 + startDate.getMinutes()) / 30,
                  ) * SLOT_HEIGHT,
              },
              useNativeDriver: false,
            }).start();
          }
        }
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
    }, [selectedDate]),
  );

  /* ---------- ANIMATED POSITIONS ---------- */
  const panRefs = useRef<Record<string, Animated.ValueXY>>({});
  const panResponders = useRef<
    Record<string, ReturnType<typeof PanResponder.create>>
  >({});

  const heightRefs = useRef<Record<string, Animated.Value>>({});

  const createPanResponder = (event: EventType) => {
    let dragging = false;
    let longPressTimer: any = null;
    let startX = 0;
    let startY = 0;

    return PanResponder.create({
      onStartShouldSetPanResponder: () => true,

      onPanResponderGrant: () => {
        // If not active, don't allow drag start
        if (activeEventIdRef.current !== event.id) {
          dragging = false;
          return;
        }

        dragging = false;

        panRefs.current[event.id].stopAnimation((pos) => {
          startX = pos.x;
          startY = pos.y;
        });

        longPressTimer = setTimeout(() => {
          dragging = true;
        }, LONG_PRESS_DELAY);
      },

      onPanResponderMove: (_, g) => {
        if (!dragging) return;

        panRefs.current[event.id].setValue({
          x: startX + g.dx,
          y: startY + g.dy,
        });
      },

      onPanResponderRelease: (_, g) => {
        if (longPressTimer) clearTimeout(longPressTimer);

        // ✅ TAP → open modal
        if (!dragging && Math.abs(g.dx) < 5 && Math.abs(g.dy) < 5) {
          setActiveEventId(event.id);
          setEditingEvent(event);
          return;
        }

        if (!dragging) return;

        // ✅ DRAG END
        const duration = event.endSlot - event.startSlot;
        const newSlot = Math.max(0, Math.round((startY + g.dy) / SLOT_HEIGHT));

        let newDayIndex = Math.round(
          (startX + g.dx - TIME_COL_WIDTH) / DAY_COLUMN_WIDTH,
        );
        newDayIndex = Math.max(0, Math.min(6, newDayIndex));

        Animated.spring(panRefs.current[event.id], {
          toValue: {
            x: TIME_COL_WIDTH + newDayIndex * DAY_COLUMN_WIDTH,
            y: newSlot * SLOT_HEIGHT,
          },
          useNativeDriver: false,
        }).start();

        // Update DB
        const d = getWeekDays(selectedDate)[newDayIndex]; // selectedDate is in scope
        socket.emit("updateEvent", {
          eventId: event.id,
          startTime: `${d.toISOString().split("T")[0]}T${slotToTime(
            newSlot,
          )}:00`,
          endTime: `${d.toISOString().split("T")[0]}T${slotToTime(
            newSlot + duration,
          )}:00`,
        });

        setEvents((prev) =>
          prev.map((e) =>
            e.id === event.id
              ? {
                ...e,
                startSlot: newSlot,
                endSlot: newSlot + duration,
                dayIndex: newDayIndex,
              }
              : e,
          ),
        );
      },
    });
  };

  const createEdgeResponder = (event: EventType, edge: "top" | "bottom") => {
    const anim = panRefs.current[event.id];
    const heightAnim = heightRefs.current[event.id];
    let startY = 0;
    let startHeight = 0;
    let currentX = 0;

    return PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        anim.stopAnimation((pos) => {
          startY = pos.y;
          currentX = pos.x;
        });
        heightAnim.stopAnimation((h) => {
          startHeight = h;
        });
      },
      onPanResponderMove: (_, g) => {
        if (edge === "top") {
          const newY = Math.max(0, startY + g.dy);
          const newHeight = Math.max(SLOT_HEIGHT, startHeight - g.dy);

          anim.setValue({ x: currentX, y: newY });
          heightAnim.setValue(newHeight);
        } else {
          const newHeight = Math.max(SLOT_HEIGHT, startHeight + g.dy);
          heightAnim.setValue(newHeight);
        }
      },
      onPanResponderRelease: () => {
        heightAnim.stopAnimation((h) => {
          anim.stopAnimation((pos) => {
            const newStartSlot = Math.round(pos.y / SLOT_HEIGHT);
            const newEndSlot = newStartSlot + Math.round(h / SLOT_HEIGHT);

            event.startSlot = edge === "top" ? newStartSlot : event.startSlot;
            event.endSlot = edge === "bottom" ? newEndSlot : event.endSlot;

            // Update DB
            const d = getWeekDays(selectedDate)[event.dayIndex];
            socket.emit("updateEvent", {
              eventId: event.id,
              startTime: `${d.toISOString().split("T")[0]}T${slotToTime(
                event.startSlot,
              )}:00`,
              endTime: `${d.toISOString().split("T")[0]}T${slotToTime(
                event.endSlot,
              )}:00`,
            });

            // Update local state
            setEvents((prev) =>
              prev.map((e) =>
                e.id === event.id
                  ? { ...e, startSlot: event.startSlot, endSlot: event.endSlot }
                  : e,
              ),
            );
          });
        });
      },
    });
  };

  // inside WeekCalendar component
  useEffect(() => {
    events.forEach((e) => {
      // initialize Animated.Value for height if not exists
      if (!heightRefs.current[e.id]) {
        heightRefs.current[e.id] = new Animated.Value(
          (e.endSlot - e.startSlot) * SLOT_HEIGHT,
        );
      } else {
        // update height when event times change
        Animated.timing(heightRefs.current[e.id], {
          toValue: (e.endSlot - e.startSlot) * SLOT_HEIGHT,
          duration: 200,
          useNativeDriver: false,
        }).start();
      }

      // also update x/y position in case dayIndex changed
      if (!panRefs.current[e.id]) {
        panRefs.current[e.id] = new Animated.ValueXY({
          x: TIME_COL_WIDTH + e.dayIndex * DAY_COLUMN_WIDTH,
          y: e.startSlot * SLOT_HEIGHT,
        });
      } else {
        Animated.spring(panRefs.current[e.id], {
          toValue: {
            x: TIME_COL_WIDTH + e.dayIndex * DAY_COLUMN_WIDTH,
            y: e.startSlot * SLOT_HEIGHT,
          },
          useNativeDriver: false,
        }).start();
      }
    });
  }, [events]);

  /* ---------- CREATE EVENT ---------- */
  const goToCreateEvent = () => {
    if (!selection) return;
    const d = days[selection.dayIndex];
    router.push({
      pathname: "/(modal)/createEvent",
      params: {
        date: d.toISOString().split("T")[0],
        start: slotToTime(selection.slotIndex),
        end: slotToTime(selection.slotIndex + 1),
      },
    });
  };

  /* ---------- UI ---------- */
  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      {/* MONTH HEADER */}
      <View style={styles.monthHeader}>
        <Text style={styles.monthText}>
          {new Date(selectedDate).toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
          })}
        </Text>
      </View>

      <View style={styles.header}>
        <View style={{ width: TIME_COL_WIDTH }} />
        {days.map((d) => (
          <View key={d.toDateString()} style={styles.dayHeader}>
            <Text style={styles.dayName}>
              {d.toLocaleDateString("en-US", { weekday: "short" })}
            </Text>
            <Text style={styles.dayDate}>{d.getDate()}</Text>
          </View>
        ))}
      </View>

      <ScrollView>
        <View
          style={{
            flexDirection: "row",
            position: "relative",
            marginLeft: -CALENDAR_SHIFT_LEFT,
            paddingRight: CALENDAR_SHIFT_LEFT,
          }}
        >
          {/* TIME COLUMN */}
          <View style={{ width: TIME_COL_WIDTH }}>
            {Array.from({ length: 48 }).map((_, i) => (
              <View key={i} style={{ height: SLOT_HEIGHT }}>
                {i % 2 === 0 && (
                  <Text style={styles.time}>{`${(i / 2) % 12 || 12} ${i < 24 ? "AM" : "PM"
                    }`}</Text>
                )}
              </View>
            ))}
          </View>

          {/* DAY COLUMNS */}
          {days.map((_, dayIndex) => (
            <View key={dayIndex} style={styles.dayColumn}>
              {Array.from({ length: 48 }).map((_, i) => (
                <TouchableOpacity
                  key={i}
                  onPress={() => setSelection({ slotIndex: i, dayIndex })}
                >
                  <View style={styles.gridSlot} />
                </TouchableOpacity>
              ))}
            </View>
          ))}

          {/* EVENTS */}
          {events.map((event) => {
            const panResponder = panResponders.current[event.id];
            const pan = panRefs.current[event.id];
            if (!panResponder || !pan) return null;

            const isActive = activeEventId === event.id;

            const topEdge = isActive ? createEdgeResponder(event, "top") : null;
            const bottomEdge = isActive
              ? createEdgeResponder(event, "bottom")
              : null;

            return (
              <Animated.View
                key={event.id}
                {...panResponder.panHandlers}
                style={[
                  styles.eventBlock,
                  {
                    transform: pan.getTranslateTransform(),
                    height: heightRefs.current[event.id],
                    backgroundColor: event.color,
                    borderWidth: isActive ? 2 : 0, // border if clicked
                    borderColor: isActive ? "#1E90FF" : "transparent",
                  },
                ]}
              >
                {isActive && (
                  <View
                    style={{
                      position: "absolute",
                      top: -10,
                      left: -10,
                      width: 30,
                      height: 30,
                      justifyContent: "center",
                      alignItems: "center",
                      zIndex: 50,
                    }}
                    {...topEdge!.panHandlers}
                  >
                    <View style={styles.topDot} />
                  </View>
                )}

                <Text style={styles.eventTime}>
                  {slotToTime(event.startSlot)} – {slotToTime(event.endSlot)}
                </Text>
                <Text style={styles.eventTitle}>{event.title}</Text>

                {isActive && (
                  <View
                    style={{
                      position: "absolute",
                      bottom: -10,
                      right: -10,
                      width: 30,
                      height: 30,
                      justifyContent: "center",
                      alignItems: "center",
                      zIndex: 50,
                    }}
                    {...bottomEdge!.panHandlers}
                  >
                    <View style={styles.bottomDot} />
                  </View>
                )}
              </Animated.View>
            );
          })}

          {/* SELECTION */}
          {selection && (
            <TouchableOpacity
              onPress={goToCreateEvent}
              style={[
                styles.selectionBlock,
                {
                  left: TIME_COL_WIDTH + selection.dayIndex * DAY_COLUMN_WIDTH,
                  top: selection.slotIndex * SLOT_HEIGHT,
                  width: DAY_COLUMN_WIDTH,
                  height: SLOT_HEIGHT,
                },
              ]}
            >
              <Text style={styles.selectionTime}>
                {slotToTime(selection.slotIndex)} –{" "}
                {slotToTime(selection.slotIndex + 1)}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
      {editingEvent && (
        <SampleModal
          event={editingEvent}
          onClose={() => {
            setEditingEvent(null);
            setActiveEventId(null);
          }}
          onUpdateEvent={(updatedEvent) => {
            setEvents((prev) =>
              prev.map((e) => (e.id === updatedEvent.id ? updatedEvent : e)),
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}

/* ---------- STYLES ---------- */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" }, // light background

  header: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  dayHeader: {
    width: DAY_COLUMN_WIDTH,
    alignItems: "center",
    paddingVertical: 6,
  },
  dayName: { color: "#555", fontSize: 11 },
  dayDate: { color: "#000", fontSize: 16, fontWeight: "600" },
  time: { color: "#555", fontSize: 10, textAlign: "right", paddingRight: 2 },

  dayColumn: {
    width: DAY_COLUMN_WIDTH,
    borderLeftWidth: 1,
    borderColor: "#eee",
  },
  gridSlot: {
    height: SLOT_HEIGHT,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    backgroundColor: "#f9f9f9",
  },
  eventBlock: {
    position: "absolute",
    width: DAY_COLUMN_WIDTH - 8,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 4,
    zIndex: 20,
    overflow: "hidden",
    justifyContent: "center",
  },
  eventTime: {
    color: "white",
    fontSize: 7,
    fontWeight: "500",
    marginBottom: 2,
  },
  eventTitle: {
    color: "white",
    fontSize: 8,
    fontWeight: "600",
    flexWrap: "wrap",
  },
  selectionBlock: {
    position: "absolute",
    width: DAY_COLUMN_WIDTH, // adjust as needed
    height: SLOT_HEIGHT,
    borderWidth: 2,
    borderColor: Colors.light.primary,
    borderRadius: 4,
    backgroundColor: "rgba(61,153,255,0.15)",
    zIndex: 30,
  },
  selectionTime: {
    color: "#000",
    fontSize: 10,
    fontWeight: "600",
    position: "absolute",
    top: 2,
    left: 4,
  },
  topDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#000",
  },
  bottomDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#000",
  },
  monthHeader: {
    width: "100%",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    backgroundColor: "#fff",
    marginLeft: 5,
    marginBottom: 5,
  },
  monthText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "600",
  },
});
