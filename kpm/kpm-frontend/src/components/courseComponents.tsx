import React from "react";
import { DropdownMenuGroup, GroupItem } from "../components/groups";
import type { TCanvasRoom } from "kpm-backend-interface";
import "./courseComponents.scss";

type TExamRoomListProps = {
  rooms?: TCanvasRoom[];
  title: string;
};
export function ExamRoomList({ rooms = [], title }: TExamRoomListProps) {
  // Only show this if rooms is array with length > 0
  if (!rooms?.length) return null;

  const roomsByYear: Record<string, TCanvasRoom[]> = {};
  rooms.forEach((room: TCanvasRoom) => {
    const examYear = room.examDate?.split("-")[0] || "other";
    if (roomsByYear[examYear] === undefined) {
      roomsByYear[examYear] = [];
    }
    roomsByYear[examYear].push(room);
  });

  return (
    <DropdownMenuGroup title={title}>
      {Object.entries(roomsByYear).map(([year, rooms]) => (
        <div className="kpm-course-rooms-dd-item">
          <h3>{year}</h3>
          <div className="kpm-col kpm-exam-room-links">
            {rooms.map((room) => (
              <li
                key={
                  room.type !== "rapp"
                    ? `${room.registrationCode}-${room.startTerm}`
                    : room.url.toString().split("/course/")[1]
                }
                className="kpm-row"
              >
                <ExamRoomLink url={room.url} name={room.name} />
              </li>
            ))}
          </div>
        </div>
      ))}
    </DropdownMenuGroup>
  );
}

type TExamRoomLinkProps = {
  url: URL | string;
  name: string;
};

export function ExamRoomLink({ url, name }: TExamRoomLinkProps) {
  // This is a Component to force consistency
  return <a href={typeof url === "string" ? url : url.href}>{name}</a>;
}
