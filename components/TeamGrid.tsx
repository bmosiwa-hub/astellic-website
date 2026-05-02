"use client";

import { useState } from "react";
import Image from "next/image";

interface TeamMember {
  name: string;
  title: string;
  shortName: string;
  photo?: string;
  bio?: string;
  profileUrl?: string;
  profileLabel?: string;
}

const COLS = 3;

function MemberCard({
  member,
  isSelected,
  onClick,
}: {
  member: TeamMember;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <div
      className={`bg-white border rounded-2xl p-6 flex flex-col items-center text-center gap-3 transition-all ${
        isSelected
          ? "border-brand-gold shadow-md"
          : "border-gray-100 shadow-sm hover:shadow-md"
      }`}
    >
      {/* Photo */}
      <div className="w-24 h-24 rounded-full overflow-hidden bg-brand-light shrink-0">
        {member.photo ? (
          <Image
            src={member.photo}
            alt={member.name}
            width={96}
            height={96}
            className="object-cover w-full h-full"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg
              className="w-10 h-10 text-brand-muted"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
              />
            </svg>
          </div>
        )}
      </div>

      {/* Name & title */}
      <div>
        <p className="font-bold text-brand-navy text-base leading-snug">
          {member.name}
        </p>
        <p className="text-brand-gold font-medium text-sm mt-0.5">
          {member.title}
        </p>
      </div>

      {/* About button */}
      {member.bio && (
        <button
          onClick={onClick}
          className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-brand-navy hover:text-brand-gold transition-colors"
        >
          About {member.shortName}
          <svg
            className={`w-4 h-4 transition-transform text-brand-gold ${
              isSelected ? "rotate-180" : ""
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
      )}
    </div>
  );
}

function ExpandedPanel({
  member,
  onClose,
}: {
  member: TeamMember;
  onClose: () => void;
}) {
  return (
    <div className="col-span-3 bg-brand-light border border-brand-gold/30 rounded-2xl p-8 relative">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-brand-muted hover:text-brand-navy transition-colors"
        aria-label="Close"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>

      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        {member.photo && (
          <div className="w-14 h-14 rounded-full overflow-hidden shrink-0">
            <Image
              src={member.photo}
              alt={member.name}
              width={56}
              height={56}
              className="object-cover w-full h-full"
            />
          </div>
        )}
        <div>
          <p className="font-bold text-brand-navy text-lg">{member.name}</p>
          <p className="text-brand-gold font-medium text-base">{member.title}</p>
        </div>
      </div>

      {/* Bio */}
      <div className="space-y-4">
        {member.bio!.split("\n\n").map((para, i) => (
          <p key={i} className="text-brand-muted text-base leading-relaxed">
            {para}
          </p>
        ))}
      </div>

      {/* External link */}
      {member.profileUrl && (
        <a
          href={member.profileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 mt-6 bg-brand-gold hover:bg-brand-gold/90 text-white px-6 py-2.5 rounded-lg text-base font-medium transition-colors"
        >
          {member.profileLabel ?? "View Full Profile"}
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
            />
          </svg>
        </a>
      )}
    </div>
  );
}

export default function TeamGrid({ members }: { members: TeamMember[] }) {
  const [selected, setSelected] = useState<number | null>(null);

  const toggle = (index: number) => {
    setSelected((prev) => (prev === index ? null : index));
  };

  // Split members into rows of COLS
  const rows: TeamMember[][] = [];
  for (let i = 0; i < members.length; i += COLS) {
    rows.push(members.slice(i, i + COLS));
  }

  return (
    <div className="space-y-6">
      {rows.map((row, rowIndex) => {
        const rowStart = rowIndex * COLS;
        const activeInRow =
          selected !== null &&
          selected >= rowStart &&
          selected < rowStart + COLS;
        const activeMember = activeInRow ? members[selected!] : null;

        return (
          <div key={rowIndex} className="grid grid-cols-3 gap-6">
            {/* Cards */}
            {row.map((member, colIndex) => {
              const globalIndex = rowStart + colIndex;
              return (
                <MemberCard
                  key={member.name}
                  member={member}
                  isSelected={selected === globalIndex}
                  onClick={() => toggle(globalIndex)}
                />
              );
            })}

            {/* Expanded panel — spans full row width, appears after cards */}
            {activeMember && (
              <ExpandedPanel
                member={activeMember}
                onClose={() => setSelected(null)}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
