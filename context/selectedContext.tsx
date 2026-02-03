// SelectedDateContext.tsx
import React, { createContext, useContext, useState } from "react";

type SelectedDateContextType = {
  selectedDate: string;
  setSelectedDate: (date: string) => void;
};

const SelectedDateContext = createContext<SelectedDateContextType | undefined>(
  undefined,
);

export const SelectedDateProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0],
  );
  // console.log(selectedDate, "selectedDate===???");
  return (
    <SelectedDateContext.Provider value={{ selectedDate, setSelectedDate }}>
      {children}
    </SelectedDateContext.Provider>
  );
};

export const useSelectedDate = () => {
  const context = useContext(SelectedDateContext);
  if (!context)
    throw new Error("useSelectedDate must be used within SelectedDateProvider");
  return context;
};
