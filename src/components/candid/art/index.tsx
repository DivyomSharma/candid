"use client";

import { LineArt, LineArtPath, type LineArtProps } from "./LineArt";

export function MoonArt(props: Omit<LineArtProps, "children">) {
  return (
    <LineArt {...props}>
      <LineArtPath d="M60 20C82 20 100 38 100 60C100 82 82 100 60 100C75 100 85 85 85 60C85 35 75 20 60 20Z" state={props.state} />
    </LineArt>
  );
}

export function VinylArt(props: Omit<LineArtProps, "children">) {
  return (
    <LineArt {...props}>
      <LineArtPath d="M60 20C82.0914 20 100 37.9086 100 60C100 82.0914 82.0914 100 60 100C37.9086 100 20 82.0914 20 60C20 37.9086 37.9086 20 60 20Z" state={props.state} delay={0} />
      <LineArtPath d="M60 45C68.2843 45 75 51.7157 75 60C75 68.2843 68.2843 75 60 75C51.7157 75 45 68.2843 45 60C45 51.7157 51.7157 45 60 45Z" state={props.state} delay={0.2} />
      <LineArtPath d="M60 58C61.1046 58 62 58.8954 62 60C62 61.1046 61.1046 62 60 62C58.8954 62 58 61.1046 58 60C58 58.8954 58.8954 58 60 58Z" state={props.state} delay={0.4} />
    </LineArt>
  );
}

export function CoffeeArt(props: Omit<LineArtProps, "children">) {
  return (
    <LineArt {...props}>
      <LineArtPath d="M30 45C30 45 30 85 45 85H65C80 85 80 45 80 45" state={props.state} delay={0} />
      <LineArtPath d="M30 45H80" state={props.state} delay={0.2} />
      <LineArtPath d="M80 50H85C90.5228 50 95 54.4772 95 60C95 65.5228 90.5228 70 85 70H80" state={props.state} delay={0.4} />
      <LineArtPath d="M45 25C50 25 50 35 55 35" state={props.state} delay={0.6} />
      <LineArtPath d="M60 20C65 20 65 35 70 35" state={props.state} delay={0.8} />
    </LineArt>
  );
}

export function ProjectorArt(props: Omit<LineArtProps, "children">) {
  return (
    <LineArt {...props}>
      <LineArtPath d="M40 45C48.2843 45 55 38.2843 55 30C55 21.7157 48.2843 15 40 15C31.7157 15 25 21.7157 25 30C25 38.2843 31.7157 45 40 45Z" state={props.state} delay={0} />
      <LineArtPath d="M80 45C88.2843 45 95 38.2843 95 30C95 21.7157 88.2843 15 80 15C71.7157 15 65 21.7157 65 30C65 38.2843 71.7157 45 80 45Z" state={props.state} delay={0.2} />
      <LineArtPath d="M35 45H85V85H35V45Z" state={props.state} delay={0.4} />
      <LineArtPath d="M20 55L35 60L35 70L20 75V55Z" state={props.state} delay={0.6} />
    </LineArt>
  );
}

export function CloudArt(props: Omit<LineArtProps, "children">) {
  return (
    <LineArt {...props}>
      <LineArtPath d="M35 70C25 70 20 60 25 50C20 40 30 35 35 40C40 25 60 25 65 40C70 30 85 30 90 40C100 45 100 60 90 70H35Z" state={props.state} delay={0} />
      <LineArtPath d="M40 75V85" state={props.state} delay={0.4} />
      <LineArtPath d="M55 75V90" state={props.state} delay={0.6} />
      <LineArtPath d="M70 75V85" state={props.state} delay={0.8} />
      <LineArtPath d="M85 75V90" state={props.state} delay={1.0} />
    </LineArt>
  );
}

export function BookOpenArt(props: Omit<LineArtProps, "children">) {
  return (
    <LineArt {...props}>
      <LineArtPath d="M60 85V25" state={props.state} delay={0} />
      <LineArtPath d="M60 85C60 85 40 80 20 85V25C40 20 60 25 60 25" state={props.state} delay={0.2} />
      <LineArtPath d="M60 85C60 85 80 80 100 85V25C80 20 60 25 60 25" state={props.state} delay={0.4} />
      <LineArtPath d="M30 40H50" state={props.state} delay={0.6} />
      <LineArtPath d="M70 40H90" state={props.state} delay={0.8} />
    </LineArt>
  );
}

export function PlantArt(props: Omit<LineArtProps, "children">) {
  return (
    <LineArt {...props}>
      <LineArtPath d="M45 70L50 95H70L75 70H45Z" state={props.state} delay={0} />
      <LineArtPath d="M60 70V30" state={props.state} delay={0.2} />
      <LineArtPath d="M60 50C45 45 35 25 35 25C45 20 55 40 60 50Z" state={props.state} delay={0.4} />
      <LineArtPath d="M60 40C75 35 85 15 85 15C75 10 65 30 60 40Z" state={props.state} delay={0.6} />
    </LineArt>
  );
}

export function CompassArt(props: Omit<LineArtProps, "children">) {
  return (
    <LineArt {...props}>
      <LineArtPath d="M60 20C82.0914 20 100 37.9086 100 60C100 82.0914 82.0914 100 60 100C37.9086 100 20 82.0914 20 60C20 37.9086 37.9086 20 60 20Z" state={props.state} delay={0} />
      <LineArtPath d="M60 30L65 55L90 60L65 65L60 90L55 65L30 60L55 55L60 30Z" state={props.state} delay={0.3} />
    </LineArt>
  );
}

export function PaperAirplaneArt(props: Omit<LineArtProps, "children">) {
  return (
    <LineArt {...props}>
      <LineArtPath d="M20 50L100 30L70 90L60 60L20 50Z" state={props.state} delay={0} />
      <LineArtPath d="M100 30L60 60L45 80" state={props.state} delay={0.4} />
    </LineArt>
  );
}

export function FountainPenArt(props: Omit<LineArtProps, "children">) {
  return (
    <LineArt {...props}>
      <LineArtPath d="M30 90L40 70L80 30L90 40L50 80L30 90Z" state={props.state} delay={0} />
      <LineArtPath d="M30 90L20 100" state={props.state} delay={0.4} />
      <LineArtPath d="M45 75L35 65" state={props.state} delay={0.6} />
    </LineArt>
  );
}

export function CandidLogoArt(props: Omit<LineArtProps, "children">) {
  return (
    <LineArt {...props}>
      <LineArtPath d="M80 30 C60 10, 20 20, 20 60 C20 100, 60 110, 80 90" state={props.state} delay={0} />
    </LineArt>
  );
}

export function StarArt(props: Omit<LineArtProps, "children">) {
  return (
    <LineArt {...props}>
      <LineArtPath d="M60 20 L65 50 L95 55 L65 60 L60 90 L55 60 L25 55 L55 50 Z" state={props.state} delay={0} />
      <LineArtPath d="M60 35 L62 52 L78 55 L62 58 L60 75 L58 58 L42 55 L58 52 Z" state={props.state} delay={0.4} />
    </LineArt>
  );
}

export function PersonArt(props: Omit<LineArtProps, "children">) {
  return (
    <LineArt {...props}>
      <LineArtPath d="M60 20 C75 20 75 45 60 45 C45 45 45 20 60 20 Z" state={props.state} delay={0} />
      <LineArtPath d="M25 90 C25 70 45 60 60 60 C75 60 95 70 95 90" state={props.state} delay={0.4} />
    </LineArt>
  );
}
