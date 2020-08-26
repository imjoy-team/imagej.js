// "Stack Tools"

    var sCmds = newMenu("Stacks Menu Tool", 
        newArray("Add Slice", "Delete Slice", "Next Slice [>]", "Previous Slice [<]", "Set Slice...", "-",
        "Convert Images to Stack", "Convert Stack to Images", "Make Montage...", "Reslice [/]...", "Z Project...",
        "3D Project...", "Plot Z-axis Profile", "-", "Start Animation", "Stop Animation", "Animation Options...",
        "-", "MRI Stack (528K)"));

    macro "Stacks Menu Tool - C037T0b11ST8b09tTcb09k" {
       cmd = getArgument();
       if (cmd!="-") run(cmd);
    }

    macro "First Slice Action Tool - C037T0d14<T7d14<" {
        setSlice(1);
    }

    macro "Previous Slice Action Tool - C037T4d14<" {
        run("Previous Slice [<]");
    }

    macro "Next Slice Action Tool - C037T4d14>" {
        run("Next Slice [>]");
    }

    macro "Last Slice Action Tool - C037T0d14>T7d14>" {
        setSlice(nSlices);
    }

    macro "Add Slice Action Tool - C037T4d14+" {
        run("Add Slice");
    }

    macro "Delete Slice Action Tool - C037T4c14-T7c14-" {
        run("Delete Slice");
    }

