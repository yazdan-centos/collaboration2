import React, { useState } from "react";
import { Mail, CalendarDays } from "lucide-react";
import Avatar from "./Avatar";

/**
 * TeamMemberDetailsCard
 *
 * Recreates an Outlook-style "contact card" popover: a header with photo,
 * name, role, quick actions, and a tabbed body (Contact / Notes / Organization).
 * Only the Contact tab is populated with fields in the reference design;
 * Notes and Organization are included as functional, empty-state tabs so the
 * component is a complete, working tab set rather than a static image clone.
 *
 * All content is driven by the `member` prop, defaulted below with sample
 * data so the component renders meaningfully out of the box.
 */

const defaultMember = {
  name: "Gordani Mohammadamin",
  jobTitle: "Software Development Specialist",
  department: "Strategic Planning and Systems dept.",
  company: "Mapna OM",
  office: "Central Office",
  directory: "",
  businessPhone: "772",
  email: "gordani_m@mps.mapnagroup.c...",
  businessAddress: "1919613871",
  avatarSrc: "",
};

const TABS = ["Contact", "Notes", "Organization"];

function FieldGroup({ label, children }) {
  return (
    <div className="mb-4">
      <div className="text-[13px] font-semibold text-slate-800 mb-1">{label}</div>
      {children}
    </div>
  );
}

function StaticField({ label, value }) {
  return (
    <div className="mb-2 last:mb-0">
      <div className="text-[13px] font-semibold text-slate-800">{label}</div>
      <div className="text-[13px] text-slate-600">{value || "\u2014"}</div>
    </div>
  );
}

function ContactTab({ member }) {
  return (
    <div className="grid grid-cols-2 gap-x-6 px-4 py-4">
      {/* Left column */}
      <div>
        <FieldGroup label="Calendar">
          <a
            href="#schedule-meeting"
            className="text-[13px] text-sky-700 hover:underline"
          >
            Schedule a meeting
          </a>
        </FieldGroup>

        <FieldGroup label="Send email">
          <a
            href={`mailto:${member.email}`}
            className="text-[13px] text-sky-700 hover:underline break-all"
          >
            {member.email}
          </a>
        </FieldGroup>

        <FieldGroup label="Business">
          <div className="text-[13px] text-slate-600">{member.businessPhone}</div>
        </FieldGroup>
      </div>

      {/* Right column */}
      <div>
        <FieldGroup label="Work">
          <StaticField label="Job title:" value={member.jobTitle} />
          <StaticField label="Department:" value={member.department} />
          <StaticField label="Company:" value={member.company} />
          <StaticField label="Office:" value={member.office} />
          <StaticField label="Directory:" value={member.directory} />
        </FieldGroup>

        <FieldGroup label="Business address">
          <div className="text-[13px] text-sky-700">{member.businessAddress}</div>
        </FieldGroup>
      </div>
    </div>
  );
}

function EmptyTab({ label }) {
  return (
    <div className="px-4 py-8 text-center text-[13px] text-slate-400">
      No {label.toLowerCase()} to show.
    </div>
  );
}

export default function TeamMemberDetailsCard({ member = defaultMember }) {
  const [activeTab, setActiveTab] = useState("Contact");
  const data = { ...defaultMember, ...member };

  return (
    <div className="w-full max-w-[480px] bg-white border border-slate-200 rounded-md shadow-sm overflow-hidden font-sans">
      {/* Header */}
      <div className="bg-slate-50 px-4 pt-4 pb-3 border-b border-slate-200">
        <div className="flex items-start gap-3">
          <Avatar src={data.avatarSrc} name={data.name} size={56} />

          <div className="flex-1 min-w-0 pt-0.5">
            <div className="text-[15px] font-semibold text-slate-900 truncate">
              {data.name}
            </div>
            <div className="text-[12.5px] text-slate-500 leading-snug mt-0.5">
              {data.jobTitle}
              {data.department ? `, ${data.department}` : ""}
            </div>

            <div className="flex items-center gap-3 mt-2">
              <button
                type="button"
                aria-label="Send email"
                className="w-7 h-7 flex items-center justify-center rounded-full border border-slate-300 text-slate-500 hover:bg-slate-100"
              >
                <Mail size={14} />
              </button>
              <button
                type="button"
                aria-label="Schedule a meeting"
                className="w-7 h-7 flex items-center justify-center rounded-full border border-slate-300 text-slate-500 hover:bg-slate-100"
              >
                <CalendarDays size={14} />
              </button>
            </div>
          </div>

          <button
            type="button"
            className="text-[13px] text-sky-700 hover:underline shrink-0"
          >
            Add
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 px-4">
        {TABS.map((tab) => {
          const isActive = tab === activeTab;
          return (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`mr-5 py-2 text-[13px] border-b-2 -mb-px transition-colors ${
                isActive
                  ? "text-sky-700 border-sky-700 font-medium"
                  : "text-slate-500 border-transparent hover:text-slate-700"
              }`}
            >
              {tab}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      {activeTab === "Contact" && <ContactTab member={data} />}
      {activeTab === "Notes" && <EmptyTab label="Notes" />}
      {activeTab === "Organization" && <EmptyTab label="Organization" />}
    </div>
  );
}
