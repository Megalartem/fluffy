"use client";

import { FAB } from "@/shared/ui/atoms";
import { Plus } from "lucide-react";
import { useState } from "react";


export default function TestUIGoalsPage() {

    return (
        <div className="flex flex-col min-h-screen bg-bg-main p-4 gap-4">
            <div className="flex items-center justify-between">
                <div className="text-lg font-semibold">Goals</div>
            </div>

            

            {/* <FAB
                aria-label="Create Goal"
                icon={Plus}
                onClick={() => {}}
            /> */}
        </div>
    );
}
