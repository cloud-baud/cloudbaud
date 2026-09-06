// spoke - cloudbaud.com - owns the owners list
import { InboxPage } from "synolic.code/shared/components/features/inbox"

const OWNERS = [
  { id: "SHARED", label: "Team Inbox", email: "team@cloudbaud.com" },
  { id: "David", label: "David", email: "david@cloudbaud.com" },
  { id: "Madhuban", label: "Madhuban", email: "madhuban@cloudbaud.com" },
  { id: "Manash", label: "Manash", email: "manash@cloudbaud.com" },
  { id: "Deepika", label: "Deepika", email: "deepika@cloudbaud.com" },
  { id: "Suhavi", label: "Suhavi", email: "suhavi@cloudbaud.com" },
]

export default function Emails() {
  return <InboxPage owners={OWNERS} defaultOwner="SHARED" />
}