"use client";
import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { MoonIcon, SunIcon } from "@radix-ui/react-icons";
import { useTheme } from "next-themes";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Navbar(props) {
  const isBrowser = () => typeof window !== "undefined"; //The approach recommended by Next.js

  function scrollToTop() {
    if (!isBrowser()) return;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  const { setTheme } = useTheme();

  return (
    <div className=" w-full z-50 fixed flex justify-center  top-4">
      <Card className="flex z-20 relative  max-h-12 p-6 max-w-screen-2xl  items-center justify-between   w-11/12 ">
        <div onClick={scrollToTop}>
          <div className=" text-sm cursor-pointer">
            <span className=" hidden md:block">Divyansh Maewal</span>
            <span className=" block md:hidden">DM</span>
          </div>
        </div>
        <div className=" flex gap-4 items-center">
          <a href="#work">
            <div className=" text-sm">Work</div>
          </a>
          <a href="#about">
            <div className=" text-sm">About</div>
          </a>
          <a href="#contact">
            <div className=" text-sm">Contact</div>
          </a>

          <div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <SunIcon className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                  <MoonIcon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                  <span className="sr-only">Toggle theme</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => {
                    setTheme("light");
                  }}
                >
                  Light
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    setTheme("dark");
                  }}
                >
                  Dark
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </Card>
    </div>
  );
}
