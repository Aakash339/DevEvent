export type EventItem = {
  image: string;
  title: string;
  slug: string;
  location: string;
  date: string;
  time: string;
};

export const events: EventItem[] = [
  {
    title: "React Summit",
    slug: "react-summit",
    image: "/images/event1.png",
    location: "Amsterdam, Netherlands",
    date: "June 11-12, 2027",
    time: "9:00 AM",
  },
  {
    title: "Google I/O",
    slug: "google-io",
    image: "/images/event2.png",
    location: "Mountain View, California",
    date: "May 19-20, 2027",
    time: "10:00 AM",
  },
  {
    title: "KubeCon + CloudNativeCon",
    slug: "kubecon-cloudnativecon",
    image: "/images/event3.png",
    location: "Barcelona, Spain",
    date: "March 22-25, 2027",
    time: "9:00 AM",
  },
  {
    title: "HackMIT",
    slug: "hackmit",
    image: "/images/event4.png",
    location: "Cambridge, Massachusetts",
    date: "September 18-19, 2027",
    time: "10:00 AM",
  },
  {
    title: "PyCon US",
    slug: "pycon-us",
    image: "/images/event5.png",
    location: "Pittsburgh, Pennsylvania",
    date: "May 12-18, 2027",
    time: "9:00 AM",
  },
  {
    title: "Local Dev Meetup",
    slug: "local-dev-meetup",
    image: "/images/event6.png",
    location: "San Francisco, California",
    date: "November 18, 2026",
    time: "6:30 PM",
  },
];
