import { describe, it, expect } from "vitest";
import {
  revealContent,
  staggerList,
  pulseTimer,
  hoverScale,
  hoverScaleReset,
} from "@/lib/animations";
import { gsap } from "gsap";

describe("Animation presets", () => {
  it("revealContent calls gsap.fromTo with correct defaults", () => {
    const target = document.createElement("div");
    revealContent(target);

    expect(gsap.fromTo).toHaveBeenCalledWith(
      target,
      { opacity: 0, y: 24 },
      expect.objectContaining({
        opacity: 1,
        y: 0,
        duration: 0.6,
        delay: 0,
        ease: "power2.out",
      })
    );
  });

  it("revealContent respects custom options", () => {
    const target = document.createElement("div");
    revealContent(target, { delay: 0.5, duration: 1, y: 40 });

    expect(gsap.fromTo).toHaveBeenCalledWith(
      target,
      { opacity: 0, y: 40 },
      expect.objectContaining({
        opacity: 1,
        y: 0,
        duration: 1,
        delay: 0.5,
      })
    );
  });

  it("staggerList calls gsap.fromTo with stagger", () => {
    const targets = [
      document.createElement("div"),
      document.createElement("div"),
    ];
    staggerList(targets);

    expect(gsap.fromTo).toHaveBeenCalledWith(
      targets,
      { opacity: 0, y: 16 },
      expect.objectContaining({
        stagger: 0.08,
        duration: 0.5,
        ease: "power2.out",
      })
    );
  });

  it("pulseTimer creates a repeating yoyo tween", () => {
    const target = document.createElement("div");
    pulseTimer(target);

    expect(gsap.to).toHaveBeenCalledWith(
      target,
      expect.objectContaining({
        scale: 1.05,
        repeat: -1,
        yoyo: true,
      })
    );
  });

  it("hoverScale applies scale-up", () => {
    const target = document.createElement("div");
    hoverScale(target, 1.05);

    expect(gsap.to).toHaveBeenCalledWith(
      target,
      expect.objectContaining({
        scale: 1.05,
        duration: 0.2,
      })
    );
  });

  it("hoverScaleReset returns to scale 1", () => {
    const target = document.createElement("div");
    hoverScaleReset(target);

    expect(gsap.to).toHaveBeenCalledWith(
      target,
      expect.objectContaining({
        scale: 1,
        duration: 0.2,
      })
    );
  });
});
