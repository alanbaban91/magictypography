/**
 * Adobe Illustrator Script to Align Text Sizes and Adjust Spacing with Full Alignment
 * Resizes text objects to match the width of the reference text
 * and ensures proper alignment and spacing between them.
 * Created by Alan Baban for Brodmann Team
 */

function main() {
    if (app.documents.length === 0) {
        alert("No document open. Please open a document and try again.");
        return;
    }

    if (app.selection.length < 2) {
        alert("Please select at least two text objects.");
        return;
    }

    // Create UI
    var dialog = new Window("dialog", "Align and Adjust Text - Created by Alan Baban for Brodmann Team");
    dialog.alignChildren = "fill";

    // Reference Text Selection
    var referenceGroup = dialog.add("group");
    referenceGroup.add("statictext", undefined, "Select reference text:");
    var refDropdown = referenceGroup.add("dropdownlist", undefined, []);
    refDropdown.preferredSize.width = 200;

    // Populate dropdown with selected text objects
    for (var i = 0; i < app.selection.length; i++) {
        if (app.selection[i].typename === "TextFrame") {
            refDropdown.add("item", "Text " + (i + 1));
        }
    }
    refDropdown.selection = 0;

    // Spacing Input
    var spacingGroup = dialog.add("group");
    spacingGroup.add("statictext", undefined, "Spacing between texts (points):");
    var spacingInput = spacingGroup.add("edittext", undefined, "10");
    spacingInput.preferredSize.width = 100;

    // Alignment Options
    var alignmentGroup = dialog.add("group");
    alignmentGroup.orientation = "column";
    alignmentGroup.alignChildren = "left";
    alignmentGroup.add("statictext", undefined, "Alignment:");
    var verticalRadio = alignmentGroup.add("radiobutton", undefined, "Vertical");
    var horizontalRadio = alignmentGroup.add("radiobutton", undefined, "Horizontal");
    verticalRadio.value = true;

    // Attribution
    var attributionGroup = dialog.add("group");
    attributionGroup.alignment = "center";
    attributionGroup.add("statictext", undefined, "Script by Alan Baban for Brodmann Team");

    // Buttons
    var buttonGroup = dialog.add("group");
    buttonGroup.alignment = "center";
    buttonGroup.add("button", undefined, "Apply", { name: "ok" });
    buttonGroup.add("button", undefined, "Cancel", { name: "cancel" });

    // Show dialog
    if (dialog.show() === 1) {
        var referenceIndex = refDropdown.selection.index;
        var spacing = parseFloat(spacingInput.text);
        var isVertical = verticalRadio.value;

        if (isNaN(spacing) || spacing < 0) {
            alert("Invalid spacing value. Please enter a positive number.");
            return;
        }

        applyAlignment(referenceIndex, spacing, isVertical);
        alert("Text alignment, resizing, and spacing adjustment complete!");
    }
}

function applyAlignment(referenceIndex, spacing, isVertical) {
    var selectedObjects = app.selection;
    var referenceText = selectedObjects[referenceIndex];

    if (referenceText.typename !== "TextFrame") {
        alert("The selected reference object is not a text frame.");
        return;
    }

    var referenceWidth = referenceText.width;

    // Sort selected objects by position (vertical or horizontal alignment)
    selectedObjects.sort(function (a, b) {
        return isVertical
            ? b.position[1] - a.position[1] // Y-position for vertical alignment
            : a.position[0] - b.position[0]; // X-position for horizontal alignment
    });

    // Resize and align text
    var basePosition = referenceText.position; // Reference object's position
    for (var i = 0; i < selectedObjects.length; i++) {
        var currentObject = selectedObjects[i];

        if (currentObject.typename === "TextFrame") {
            // Resize to match reference width
            var scalingFactor = referenceWidth / currentObject.width;
            var textRange = currentObject.textRange;
            textRange.characterAttributes.size *= scalingFactor;
            currentObject.width = referenceWidth;

            // Adjust position for spacing
            if (i > 0) {
                var prevObject = selectedObjects[i - 1];
                if (isVertical) {
                    currentObject.position = [
                        basePosition[0], // Align to the X-position of the reference
                        prevObject.position[1] - prevObject.height - spacing // Y-position adjusted
                    ];
                } else {
                    currentObject.position = [
                        prevObject.position[0] + prevObject.width + spacing, // X-position adjusted
                        basePosition[1] // Align to the Y-position of the reference
                    ];
                }
            } else {
                // Align the reference text's position to the base
                currentObject.position = basePosition;
            }
        }
    }
}

main();
