import Colors from "@/constants/Colors";
import { useSelectedDate } from "@/context/selectedContext";
import { daysOfWeek, monthNames } from "@/lib/helper";
import { socket } from "@/lib/socket";
import { useFocusEffect } from "@react-navigation/native";
import axios from "axios";
import { useRouter } from "expo-router";
import { Plus } from "lucide-react-native";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Modal,
  PanResponder,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type EventType = {
  _id: string;
  title: string;
  startTime: string;
  endTime: string;
};

export default function CalendarScreen() {
  const router = useRouter();
  const { setSelectedDate } = useSelectedDate();

  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());

  const [monthOpen, setMonthOpen] = useState(false);
  const [yearOpen, setYearOpen] = useState(false);

  const [events, setEvents] = useState<EventType[]>([]);

  const years = useMemo(() => {
    const y = today.getFullYear();
    return Array.from({ length: 50 }, (_, i) => y - 25 + i);
  }, []);

  const cellsRefs = useRef<any[]>([]); // store refs to each day cell
  const draggingEventId = useRef<string | null>(null);
  const isDraggingEvent = useRef(false);

  const mergeDateWithTime = (dateStr: string, isoTime: string) => {
    const old = new Date(isoTime);
    const [y, m, d] = dateStr.split("-").map(Number);

    const merged = new Date(old);
    merged.setFullYear(y);
    merged.setMonth(m - 1);
    merged.setDate(d);

    return merged.toISOString();
  };

  const handleEventDrop = (event: EventType, pos: { x: number; y: number }) => {
    cellsRefs.current.forEach((cell, index) => {
      if (!cell) return;

      cell.measure(
        (
          _x: number,
          _y: number,
          width: number,
          height: number,
          pageX: number,
          pageY: number,
        ) => {
          const insideX = pos.x >= pageX && pos.x <= pageX + width;
          const insideY = pos.y >= pageY && pos.y <= pageY + height;
          if (!insideX || !insideY) return;

          const day = cells[index];
          if (!day) return;

          const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(
            2,
            "0",
          )}-${String(day).padStart(2, "0")}`;

          const newStartTime = mergeDateWithTime(dateStr, event.startTime);
          const newEndTime = mergeDateWithTime(dateStr, event.endTime);

          socket.emit("updateEvent", {
            eventId: event._id,
            startTime: newStartTime,
            endTime: newEndTime,
          });

          setEvents((prev) =>
            prev.map((e) =>
              e._id === event._id
                ? { ...e, startTime: newStartTime, endTime: newEndTime }
                : e,
            ),
          );
        },
      );
    });
  };

  /* ---------- FETCH EVENTS ---------- */
  const fetchEvents = async () => {
    try {
      const res = await axios.get(
        "http://192.168.1.75:5000/api/events/getEvents",
      );
      setEvents(res.data);
    } catch (e) {
      console.error("Failed to fetch events", e);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchEvents();
    }, []),
  );

  /* ---------- SOCKET ---------- */
  useEffect(() => {
    socket.on("eventCreated", (e) =>
      setEvents((p) => [...p.filter((x) => x._id !== e._id), e]),
    );
    socket.on("eventUpdated", (e) =>
      setEvents((p) => p.map((x) => (x._id === e._id ? e : x))),
    );
    socket.on("eventDeleted", ({ id }) =>
      setEvents((p) => p.filter((x) => x._id !== id)),
    );

    return () => {
      socket.off("eventCreated");
      socket.off("eventUpdated");
      socket.off("eventDeleted");
    };
  }, []);

  /* ---------- GROUP EVENTS ---------- */
  const eventsByDate = useMemo(() => {
    const map: Record<string, EventType[]> = {};
    events.forEach((e) => {
      const d = new Date(e.startTime);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
        2,
        "0",
      )}-${String(d.getDate()).padStart(2, "0")}`;

      if (!map[key]) map[key] = [];
      map[key].push(e);
    });
    return map;
  }, [events]);

  /* ---------- CALENDAR CELLS ---------- */
  const cells = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const offset = (firstDay + 6) % 7;

    const result: (number | null)[] = [];
    for (let i = 0; i < offset; i++) result.push(null);
    for (let d = 1; d <= daysInMonth; d++) result.push(d);
    while (result.length % 7 !== 0) result.push(null);
    return result;
  }, [currentMonth, currentYear]);

  const DraggableEvent = ({
    event,
    onDrop,
  }: {
    event: EventType;
    onDrop: (event: EventType, pos: { x: number; y: number }) => void;
  }) => {
    const translate = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
    const dragging = useRef(false);
    const touchStart = useRef({ x: 0, y: 0 });
    const viewRef = useRef<View>(null);
    const TAP_THRESHOLD = 5;
    const panResponder = useRef(
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onPanResponderGrant: (e) => {
          touchStart.current = {
            x: e.nativeEvent.pageX,
            y: e.nativeEvent.pageY,
          };
          dragging.current = false;
          draggingEventId.current = event._id;
          isDraggingEvent.current = true;
        },
        onPanResponderMove: (_, g) => {
          if (!dragging.current) {
            if (Math.abs(g.dx) > 5 || Math.abs(g.dy) > 5)
              dragging.current = true;
          }
          if (dragging.current) {
            translate.setValue({ x: g.dx, y: g.dy });
          }
        },
        onPanResponderRelease: (_, g) => {
          const dx = g.moveX - touchStart.current.x;
          const dy = g.moveY - touchStart.current.y;

          if (
            !dragging.current &&
            Math.abs(dx) < TAP_THRESHOLD &&
            Math.abs(dy) < TAP_THRESHOLD
          ) {
            // Quick tap → open modal
            router.push({
              pathname: "/(modal)/createEvent",
              params: { eventId: event._id, mode: "edit" },
            });
          } else if (dragging.current) {
            // Drag → call onDrop
            onDrop(event, { x: g.moveX, y: g.moveY });
          }

          dragging.current = false;
          draggingEventId.current = null;
          isDraggingEvent.current = false;

          Animated.timing(translate, {
            toValue: { x: 0, y: 0 },
            duration: 150,
            useNativeDriver: false,
          }).start();
        },

        onPanResponderTerminate: () => {
          dragging.current = false;
          draggingEventId.current = null;
          isDraggingEvent.current = false;
          Animated.timing(translate, {
            toValue: { x: 0, y: 0 },
            duration: 150,
            useNativeDriver: false,
          }).start();
        },
      }),
    ).current;

    return (
      <Animated.View
        ref={viewRef}
        {...panResponder.panHandlers}
        style={{
          transform: translate.getTranslateTransform(),
          zIndex: dragging.current ? 1000 : 1,
        }}
      >
        <View style={styles.eventPill}>
          <Text style={styles.eventPillText}>{event.title}</Text>
        </View>
      </Animated.View>
    );
  };

  /* ---------- UI ---------- */
  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Pressable onPress={() => setMonthOpen(true)}>
          <Text style={styles.headerTitle}>{monthNames[currentMonth]} ▼</Text>
        </Pressable>

        <Pressable onPress={() => setYearOpen(true)}>
          <Text style={styles.yearText}>{currentYear} ▼</Text>
        </Pressable>

        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push("/(modal)/createEvent")}
        >
          <Plus size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* WEEK */}
      <View style={styles.weekRow}>
        {daysOfWeek.map((d, i) => (
          <Text key={`${d}-${i}`} style={styles.weekText}>
            {d}
          </Text>
        ))}
      </View>

      {/* GRID */}
      <View style={styles.grid}>
        {cells.map((day, i) => {
          if (!day) return <View key={i} style={styles.cell} />;

          const dateKey = `${currentYear}-${String(currentMonth + 1).padStart(
            2,
            "0",
          )}-${String(day).padStart(2, "0")}`;

          const isToday =
            day === today.getDate() &&
            currentMonth === today.getMonth() &&
            currentYear === today.getFullYear();

          return (
            <Pressable
              key={i}
              style={[styles.cell, isToday && styles.todayCell]}
              ref={(el) => {
                cellsRefs.current[i] = el;
              }}
              onPress={() => {
                setSelectedDate(dateKey);
                router.push({
                  pathname: "/(modal)/createEvent",
                  params: { date: dateKey },
                });
              }}
            >
              <Text style={[styles.dayText, isToday && styles.todayText]}>
                {day}
              </Text>

              {eventsByDate[dateKey]?.map((e) => {
                if (draggingEventId.current === e._id) return null; // hide while dragging
                return (
                  <DraggableEvent
                    key={e._id}
                    event={e}
                    onDrop={handleEventDrop}
                  />
                );
              })}
            </Pressable>
          );
        })}
      </View>

      {/* MONTH DROPDOWN */}
      <Modal transparent visible={monthOpen} animationType="fade">
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setMonthOpen(false)}
        >
          <View style={styles.modalContent}>
            <ScrollView>
              {monthNames.map((m, i) => (
                <Pressable
                  key={m}
                  style={styles.item}
                  onPress={() => {
                    setCurrentMonth(i);
                    setMonthOpen(false);
                  }}
                >
                  <Text style={styles.itemText}>{m}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>

      {/* YEAR DROPDOWN */}
      <Modal transparent visible={yearOpen} animationType="fade">
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setYearOpen(false)}
        >
          <View style={styles.modalContent}>
            <ScrollView>
              {years.map((y) => (
                <Pressable
                  key={y}
                  style={styles.item}
                  onPress={() => {
                    setCurrentYear(y);
                    setYearOpen(false);
                  }}
                >
                  <Text style={styles.itemText}>{y}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

/* ---------- STYLES ---------- */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light.background },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.light.text,
  },
  yearText: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.light.text,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.light.primary,
    justifyContent: "center",
    alignItems: "center",
  },

  weekRow: { flexDirection: "row", borderBottomWidth: 1, borderColor: "#eee" },
  weekText: {
    flex: 1,
    textAlign: "center",
    paddingVertical: 8,
    color: "#888",
  },

  grid: { flexDirection: "row", flexWrap: "wrap" },
  cell: {
    width: "14.2857%",
    height: 90,
    borderWidth: 1,
    borderColor: "#eee",
    padding: 6,
  },

  dayText: { fontSize: 14, color: Colors.light.text },
  todayCell: { borderColor: Colors.light.primary, borderWidth: 2 },
  todayText: { color: Colors.light.primary, fontWeight: "700" },

  eventDot: {
    fontSize: 11,
    marginTop: 4,
    color: Colors.light.primary,
    fontWeight: "600",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: 220,
    maxHeight: 300,
    backgroundColor: "#fff",
    borderRadius: 10,
  },
  item: { padding: 14 },
  itemText: { fontSize: 16, color: "#000" },
  eventPill: {
    backgroundColor: Colors.light.primary, // same as + button
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginTop: 4,
  },

  eventPillText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "600",
  },
});
