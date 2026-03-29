"use client";

import { Show, SignInButton, SignUpButton, UserButton, OrganizationSwitcher, CreateOrganization } from "@clerk/nextjs";
import Link from "next/link";

export function PublicHeader() {
  return (
    <>
      <header className="flex justify-end items-center p-4 gap-4 h-16 border-b">
        <Show when="signed-out">
          <SignInButton />
          <SignUpButton>
            <button className="bg-emerald-600 text-white rounded-full font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 cursor-pointer hover:bg-emerald-700 transition-colors">
              Sign Up
            </button>
          </SignUpButton>
        </Show>
        <Show when="signed-in">
          <div className="flex items-center gap-2">
            <OrganizationSwitcher />
            <CreateOrganization />
            <UserButton />
          </div>
        </Show>
      </header>
    </>
  );
}