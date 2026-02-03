import Colors from "@/constants/Colors";
import { useSelectedDate } from "@/context/selectedContext";
import { socket } from "@/lib/socket";
import { useFocusEffect } from "@react-navigation/native";
import axios from "axios";
import { router } from "expo-router";
import React, { useRef, useState } from "react";
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
const ROW_HEIGHT = 50;
const SLOT_HEIGHT = ROW_HEIGHT / 2; // 30 mins
const LONG_PRESS_DELAY = 1000;
const SCREEN_WIDTH = Dimensions.get("window").width;
const TIME_COL_WIDTH = 60;
const DAY_COLUMN_WIDTH = Math.floor((SCREEN_WIDTH - TIME_COL_WIDTH) / 3);
const EVENT_X_OFFSET = TIME_COL_WIDTH;

/* ---------- TYPES ---------- */
type EventType = {
  id: string;
  title: string;
  startSlot: number;
  endSlot: number;
  color?: string;
  dayIndex: number;
  start?: string;
  end?: string;
};
// const EVENT_X_OFFSET = TIME_COL_WIDTH;

const TOTAL_SLOTS = 48;
const GRID_HEIGHT = TOTAL_SLOTS * SLOT_HEIGHT;
/* ---------- UTILS ---------- */
const getThreeDays = (dateStr: string) => {
  const base = new Date(dateStr);
  return [0, 1, 2].map((i) => {
    const d = new Date(base);
    d.setDate(base.getDate() + i);
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
/* =================== THREE DAYS VIEW =================== */
/* ======================================================= */

export default function ThreeDaysCalander() {
  const { selectedDate, setSelectedDate } = useSelectedDate();

  React.useEffect(() => {
    if (!selectedDate) {
      setSelectedDate(new Date().toISOString());
    }
  }, []);

  const days = getThreeDays(selectedDate || new Date().toISOString());
  // console.log(days, "days are????");
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorParams, setEditorParams] = useState<{
    eventId?: string;
  } | null>(null);
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
  const format24h = (date: Date) =>
    date.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

  // Make Animated values follow event changes
  React.useEffect(() => {
    events.forEach((e) => {
      const height = (e.endSlot - e.startSlot) * SLOT_HEIGHT;

      // POSITION
      Animated.timing(panRefs.current[e.id], {
        toValue: {
          x: e.dayIndex * DAY_COLUMN_WIDTH,
          y: e.startSlot * SLOT_HEIGHT,
        },
        duration: 180,
        useNativeDriver: false,
      }).start();

      // HEIGHT
      Animated.timing(heightRefs.current[e.id], {
        toValue: height,
        duration: 180,
        useNativeDriver: false,
      }).start();
    });
  }, [events]);

  /* ---------- FETCH 3-DAY EVENTS ---------- */
  const fetchThreeDaysEvents = async () => {
    try {
      const results = await Promise.all(
        days.map(async (d, dayIndex) => {
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
            const endSlot = Math.floor(
              (endDate.getHours() * 60 + endDate.getMinutes()) / 30,
            );

            return {
              id: e._id,
              title: e.title,
              startSlot,
              endSlot,
              start: format24h(startDate),
              end: format24h(endDate),
              color: Colors.light.primary,

              dayIndex,
            };
          });
        }),
      );

      setEvents(results.flat());
      // console.log("3-day calendar events:", results.flat());
    } catch (err) {
      console.log("3-day fetch error:", err);
    }
  };

  /* ---------- SOCKET EVENTS ---------- */
  useFocusEffect(
    React.useCallback(() => {
      fetchThreeDaysEvents(); // initial fetch

      const onEventCreated = (e: any) => {
        const startDate = new Date(e.startTime);
        const endDate = new Date(e.endTime);
        const dayIndex = days.findIndex(
          (d) =>
            d.toISOString().split("T")[0] ===
            startDate.toISOString().split("T")[0],
        );
        if (dayIndex === -1) return;

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
          start: format24h(startDate),
          end: format24h(endDate),
          color: e.color || Colors.light.primary,
          dayIndex,
        };

        setEvents((prev) =>
          prev.some((p) => p.id === e._id) ? prev : [...prev, newEvent],
        );
        setSelection(null);
      };

      const onEventUpdated = (updatedEvent: any) => {
        // Recalculate 3-day window
        const days = getThreeDays(selectedDate);

        const startDate = new Date(updatedEvent.startTime);
        const endDate = new Date(updatedEvent.endTime);

        const dayIndex = days.findIndex(
          (d) =>
            d.toISOString().split("T")[0] ===
            startDate.toISOString().split("T")[0],
        );

        if (dayIndex === -1) return; // safety check

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
                dayIndex,
                title: updatedEvent.title,
                color: updatedEvent.color || Colors.light.primary,
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
        setSelection(null); // clear selection on navigation away
      };
    }, [selectedDate]),
  );

  /* ---------- ANIMATED POSITIONS ---------- */
  const panRefs = useRef<Record<string, Animated.ValueXY>>({});

  const heightRefs = useRef<Record<string, Animated.Value>>({});

  // Initialize pan and height refs
  events.forEach((e) => {
    if (!panRefs.current[e.id]) {
      panRefs.current[e.id] = new Animated.ValueXY({
        x: e.dayIndex * DAY_COLUMN_WIDTH,
        y: e.startSlot * SLOT_HEIGHT,
      });
      heightRefs.current[e.id] = new Animated.Value(
        (e.endSlot - e.startSlot) * SLOT_HEIGHT,
      );
    }
  });

  let offsetX = 0;
  let offsetY = 0;
  /* ---------- DRAG ---------- */
  const createPanResponder = (event: EventType) => {
    let dragging = false;
    let longPressTimer: NodeJS.Timeout | null = null;
    let startX = 0;
    let startY = 0;

    return PanResponder.create({
      onStartShouldSetPanResponder: () => true,

      onPanResponderGrant: () => {
        dragging = false;
        let longPressTimer: number | null = null;
        // Start 1-second long press timer
        longPressTimer = setTimeout(() => {
          dragging = true;
        }, LONG_PRESS_DELAY);

        panRefs.current[event.id].stopAnimation((pos) => {
          startX = pos.x;
          startY = pos.y;
        });
      },

      onPanResponderMove: (_, g) => {
        // Only move after long press fires
        if (!dragging) return;

        panRefs.current[event.id].setValue({
          x: startX + g.dx,
          y: startY + g.dy,
        });
      },

      onPanResponderRelease: () => {
        if (longPressTimer) clearTimeout(longPressTimer);

        // If not dragged → open editor
        if (!dragging) {
          setEditorParams({ eventId: event.id });
          setEditorOpen(true);
          return;
        }

        const duration = event.endSlot - event.startSlot;

        panRefs.current[event.id].stopAnimation((pos) => {
          // Y → TIME SLOT
          let newSlot = Math.round(pos.y / SLOT_HEIGHT);
          newSlot = Math.max(0, Math.min(TOTAL_SLOTS - duration, newSlot));

          // X → DAY COLUMN
          let newDayIndex = Math.floor(pos.x / DAY_COLUMN_WIDTH);
          newDayIndex = Math.max(0, Math.min(2, newDayIndex));

          // Snap to correct day if event crosses midnight
          const newEndSlot = newSlot + duration;
          const endDate = new Date(days[newDayIndex]);
          endDate.setHours(0, 0, 0, 0);
          endDate.setMinutes(newEndSlot * 30);

          const endDayIndex = days.findIndex(
            (d) =>
              d.toISOString().split("T")[0] ===
              endDate.toISOString().split("T")[0],
          );
          if (endDayIndex !== -1) newDayIndex = endDayIndex;

          // Animate to snapped position
          Animated.spring(panRefs.current[event.id], {
            toValue: {
              x: newDayIndex * DAY_COLUMN_WIDTH,
              y: newSlot * SLOT_HEIGHT,
            },
            useNativeDriver: false,
          }).start();

          // Update state
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

          // Sync with backend
          const d = days[newDayIndex];
          socket.emit("updateEvent", {
            eventId: event.id,
            startTime: `${d.toISOString().split("T")[0]}T${slotToTime(
              newSlot,
            )}:00`,
            endTime: `${d.toISOString().split("T")[0]}T${slotToTime(
              newSlot + duration,
            )}:00`,
          });
        });
      },

      onPanResponderTerminate: () => {
        if (longPressTimer) clearTimeout(longPressTimer);
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
        // Calculate new start/end slots
        heightAnim.stopAnimation((h) => {
          anim.stopAnimation((pos) => {
            const newStartSlot = Math.round(pos.y / SLOT_HEIGHT);
            const newEndSlot = newStartSlot + Math.round(h / SLOT_HEIGHT);

            event.startSlot = newStartSlot;
            event.endSlot = newEndSlot;

            // Sync to server
            const d = days[event.dayIndex];
            socket.emit("updateEvent", {
              eventId: event.id,
              startTime: `${d.toISOString().split("T")[0]}T${slotToTime(
                event.startSlot,
              )}:00`,
              endTime: `${d.toISOString().split("T")[0]}T${slotToTime(
                event.endSlot,
              )}:00`,
            });

            // Update state
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

  /* ---------- SELECTION ---------- */
  const handleSlotPress = (slotIndex: number, dayIndex: number) =>
    setSelection({ slotIndex, dayIndex });

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
      <View style={styles.header}>
        <View style={{ width: TIME_COL_WIDTH }} />
        {days.map((d) => (
          <View key={d.toDateString()} style={styles.dayHeader}>
            <Text style={styles.dayName}>
              {d.toLocaleDateString("en-US", { weekday: "short" })}
            </Text>
            <Text style={styles.dayDate}>
              {`${d.getDate()} ${d.toLocaleString("default", {
                month: "short",
              })}`}
            </Text>
          </View>
        ))}
      </View>

      <ScrollView
        contentContainerStyle={{
          width: TIME_COL_WIDTH + DAY_COLUMN_WIDTH * 3,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            position: "relative",
            height: GRID_HEIGHT,
            // width: TIME_COL_WIDTH + DAY_COLUMN_WIDTH * 3,
            // marginLeft: -10,
          }}
        >
          {/* TIME COLUMN */}
          <View style={{ width: TIME_COL_WIDTH }}>
            {Array.from({ length: 48 }).map((_, i) => (
              <View key={i} style={{ height: SLOT_HEIGHT }}>
                {i % 2 === 0 && (
                  <Text style={styles.time}>
                    {`${(i / 2) % 12 || 12} ${i < 24 ? "AM" : "PM"}`}
                  </Text>
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
                  onPress={() => handleSlotPress(i, dayIndex)}
                >
                  <View style={styles.gridSlot} />
                </TouchableOpacity>
              ))}
            </View>
          ))}

          {/* EVENTS */}
          {events.map((event) => {
            const isSelected = editorParams?.eventId === event.id; // clicked event
            const pan = isSelected
              ? createPanResponder(event)
              : { panHandlers: {} };
            const topEdge = isSelected
              ? createEdgeResponder(event, "top")
              : { panHandlers: {} };
            const bottomEdge = isSelected
              ? createEdgeResponder(event, "bottom")
              : { panHandlers: {} };

            return (
              <TouchableOpacity
                key={event.id}
                activeOpacity={1}
                onPress={() => {
                  setEditorParams({ eventId: event.id });
                  setEditorOpen(true);
                }}
                style={{ position: "absolute" }}
              >
                <Animated.View
                  {...pan.panHandlers}
                  style={[
                    styles.eventBlock,
                    {
                      transform: [
                        {
                          translateX: Animated.add(
                            panRefs.current[event.id].x,
                            EVENT_X_OFFSET,
                          ),
                        },
                        { translateY: panRefs.current[event.id].y },
                      ],
                      height: heightRefs.current[event.id],
                      backgroundColor: event.color,
                      borderWidth: isSelected ? 2 : 0, // border if clicked
                      borderColor: isSelected ? "#1E90FF" : "transparent", // brighter blue border
                    },
                  ]}
                >
                  {/* TOP DOT */}
                  {isSelected && (
                    <View
                      style={{
                        position: "absolute",
                        top: -10, // extend touch area 10px above
                        left: -10,
                        width: 26, // touch area width
                        height: 26, // touch area height
                        justifyContent: "center",
                        alignItems: "center",
                        zIndex: 50,
                      }}
                      {...topEdge.panHandlers}
                    >
                      {/* Small visible dot */}
                      <View style={styles.topDot} />
                    </View>
                  )}

                  <Text style={styles.eventTime}>
                    {slotToTime(event.startSlot)} – {slotToTime(event.endSlot)}
                  </Text>
                  <Text style={styles.eventTitle}>{event.title}</Text>

                  {/* BOTTOM DOT */}
                  {isSelected && (
                    <View
                      style={{
                        position: "absolute",
                        bottom: -10, // extend touch area 10px below
                        right: -10,
                        width: 26,
                        height: 26,
                        justifyContent: "center",
                        alignItems: "center",
                        zIndex: 50,
                      }}
                      {...bottomEdge.panHandlers}
                    >
                      {/* Small visible dot */}
                      <View style={styles.bottomDot} />
                    </View>
                  )}
                </Animated.View>
              </TouchableOpacity>
            );
          })}

          {/* SELECTION */}
          {selection && (
            <TouchableOpacity
              onPress={goToCreateEvent}
              style={[
                styles.selectionBlock,
                {
                  left:
                    TIME_COL_WIDTH + selection.dayIndex * DAY_COLUMN_WIDTH + 4,
                  top: selection.slotIndex * SLOT_HEIGHT,
                  width: DAY_COLUMN_WIDTH - 8,
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
      {editorOpen && (
        <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
          <SampleModal
            event={events.find((e) => e.id === editorParams?.eventId)}
            onClose={() => {
              setEditorOpen(false);
              setEditorParams(null);
            }}
            onUpdateEvent={(updatedEvent) => {
              setEvents((prev) =>
                prev.map((e) =>
                  e.id === updatedEvent.id ? { ...e, ...updatedEvent } : e,
                ),
              );

              // 🔁 sync animated values
              const pan = panRefs.current[updatedEvent.id];
              const height = heightRefs.current[updatedEvent.id];

              if (pan && height) {
                Animated.parallel([
                  Animated.timing(pan, {
                    toValue: {
                      x: updatedEvent.dayIndex * DAY_COLUMN_WIDTH,
                      y: updatedEvent.startSlot * SLOT_HEIGHT,
                    },
                    duration: 150,
                    useNativeDriver: false,
                  }),
                  Animated.timing(height, {
                    toValue:
                      (updatedEvent.endSlot - updatedEvent.startSlot) *
                      SLOT_HEIGHT,
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
}

/* ---------- STYLES (LIGHT THEME) ---------- */
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
    // overflow: "hidden",
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
    width: 102,
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
});
