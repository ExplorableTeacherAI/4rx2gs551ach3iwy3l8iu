import { type ReactElement } from "react";
import { Block } from "@/components/templates";
import { StackLayout, SplitLayout } from "@/components/layouts";
import {
    EditableH1,
    EditableH2,
    EditableParagraph,
    InlineScrubbleNumber,
    InlineSpotColor,
    InlineFormula,
    InlineTooltip,
    Cartesian2D,
} from "@/components/atoms";
import { FormulaBlock } from "@/components/molecules";
import { InteractionHintSequence } from "@/components/atoms/visual/InteractionHint";
import {
    getVariableInfo,
    numberPropsFromDefinition,
    scrubVarsFromDefinitions,
} from "../variables";
import { useVar, useSetVar } from "@/stores";

// Reactive visualization showing a basic parabola with color-coded points
function IntroParabolaViz() {
    const a = useVar("coefficientA", 1) as number;
    const b = useVar("coefficientB", 0) as number;
    const c = useVar("coefficientC", 0) as number;
    const setVar = useSetVar();

    // Calculate vertex position
    const vertexX = a !== 0 ? -b / (2 * a) : 0;
    const vertexY = a * vertexX * vertexX + b * vertexX + c;

    // Color constants matching the formula
    const COLOR_A = "#62D0AD"; // Teal for 'a'
    const COLOR_C = "#F7B23B"; // Amber for 'c'
    const COLOR_CURVE = "#6366f1"; // Soft indigo for f(x) curve

    // Fixed y-level for the draggable points (they stay at this height)
    const fixedY = 2;
    // Calculate x positions on the curve at the fixed y level: y = ax² + bx + c
    // Solving ax² + bx + c = fixedY → ax² + bx + (c - fixedY) = 0
    // Using quadratic formula: x = (-b ± √(b² - 4a(c - fixedY))) / (2a)
    const disc = b * b - 4 * a * (c - fixedY);
    let rightX = 2;
    let leftX = -2;
    if (disc >= 0 && a !== 0) {
        const sqrtDisc = Math.sqrt(disc);
        const x1 = (-b + sqrtDisc) / (2 * a);
        const x2 = (-b - sqrtDisc) / (2 * a);
        rightX = Math.max(x1, x2);
        leftX = Math.min(x1, x2);
        // Clamp to reasonable bounds
        rightX = Math.max(0.5, Math.min(5, rightX));
        leftX = Math.max(-5, Math.min(-0.5, leftX));
    }

    return (
        <div className="relative">
            <Cartesian2D
                height={350}
                viewBox={{ x: [-6, 6], y: [-8, 6] }}
                movablePoints={[
                    // Right point - drag horizontally at fixed y to change curve width
                    {
                        initial: [rightX, fixedY],
                        color: COLOR_A,
                        position: [rightX, fixedY],
                        constrain: (point) => {
                            // Keep y fixed, only allow horizontal movement
                            const x = Math.max(0.5, Math.min(5, point[0]));
                            return [x, fixedY];
                        },
                        onChange: (point) => {
                            // y = ax² + bx + c at this point
                            // With the point at (x, fixedY): fixedY = ax² + bx + c
                            // So a = (fixedY - bx - c) / x²
                            const x = point[0];
                            if (x > 0.3) {
                                const newA = (fixedY - b * x - c) / (x * x);
                                if (newA > 0.1 && newA <= 3) {
                                    // Smooth continuous update (no rounding)
                                    setVar("coefficientA", Math.round(newA * 20) / 20);
                                }
                            }
                        },
                    },
                    // Left point - mirrors the right point horizontally
                    {
                        initial: [leftX, fixedY],
                        color: COLOR_A,
                        position: [leftX, fixedY],
                        constrain: (point) => {
                            // Keep y fixed, only allow horizontal movement
                            const x = Math.min(-0.5, Math.max(-5, point[0]));
                            return [x, fixedY];
                        },
                        onChange: (point) => {
                            const x = point[0];
                            if (x < -0.3) {
                                const newA = (fixedY - b * x - c) / (x * x);
                                if (newA > 0.1 && newA <= 3) {
                                    // Smooth continuous update (no rounding)
                                    setVar("coefficientA", Math.round(newA * 20) / 20);
                                }
                            }
                        },
                    },
                    // Y-intercept point (amber 'c' point)
                    {
                        initial: [0, c],
                        color: COLOR_C,
                        position: [0, c],
                        constrain: "vertical",
                        onChange: (point) => {
                            // Smooth continuous update
                            const newC = Math.round(point[1] * 4) / 4;
                            if (newC >= -6 && newC <= 5) {
                                setVar("coefficientC", newC);
                            }
                        },
                    },
                ]}
                highlightVarName="introFormulaHighlight"
                plots={[
                    // Main parabola curve
                    {
                        type: "function",
                        fn: (x: number) => a * x * x + b * x + c,
                        color: COLOR_CURVE,
                        weight: 3,
                        highlightId: "fx",
                    },
                    // Horizontal line at fixedY showing where the drag points are
                    {
                        type: "segment",
                        point1: [leftX, fixedY],
                        point2: [rightX, fixedY],
                        color: COLOR_A,
                        weight: 2,
                        style: "dashed",
                    },
                    // Axis of symmetry (dashed)
                    {
                        type: "segment",
                        point1: [vertexX, -8],
                        point2: [vertexX, 6],
                        color: "#94a3b8",
                        weight: 1,
                        style: "dashed",
                    },
                ]}
            />
            <InteractionHintSequence
                hintKey="intro-parabola-drag"
                steps={[
                    {
                        gesture: "drag-horizontal",
                        label: "Drag the teal points on the curve to change steepness",
                        position: { x: "75%", y: "25%" },
                    },
                ]}
            />
        </div>
    );
}

export const introductionBlocks: ReactElement[] = [
    // Title
    <StackLayout key="layout-intro-title" maxWidth="xl">
        <Block id="intro-title" padding="md">
            <EditableH1 id="h1-intro-title" blockId="intro-title">
                Quadratic Functions: The Shape of a Parabola
            </EditableH1>
        </Block>
    </StackLayout>,

    // Hook paragraph
    <StackLayout key="layout-intro-hook" maxWidth="xl">
        <Block id="intro-hook" padding="sm">
            <EditableParagraph id="para-intro-hook" blockId="intro-hook">
                Every time you throw a ball, water shoots from a fountain, or a rocket arcs through the sky, you're seeing a{" "}
                <InlineTooltip id="tooltip-intro-parabola" tooltip="A U-shaped curve formed by the graph of a quadratic function">
                    parabola
                </InlineTooltip>
                . This distinctive U-shaped curve appears everywhere in nature and engineering. But what controls whether the parabola opens wide or narrow? What makes it point up or down?
            </EditableParagraph>
        </Block>
    </StackLayout>,

    // The formula introduction
    <StackLayout key="layout-intro-formula-heading" maxWidth="xl">
        <Block id="intro-formula-heading" padding="sm">
            <EditableH2 id="h2-intro-formula-heading" blockId="intro-formula-heading">
                The Standard Form
            </EditableH2>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-intro-formula-explanation" maxWidth="xl">
        <Block id="intro-formula-explanation" padding="sm">
            <EditableParagraph id="para-intro-formula-explanation" blockId="intro-formula-explanation">
                A quadratic function is written in standard form as{" "}
                <InlineFormula
                    latex="\clr{fx}{f(x)} = \clr{a}{a}x^2 + \clr{b}{b}x + \clr{c}{c}"
                    colorMap={{ fx: "#6366f1", a: "#62D0AD", b: "#8E90F5", c: "#F7B23B" }}
                />
                . The three coefficients{" "}
                <InlineSpotColor varName="coefficientA" color="#62D0AD">a</InlineSpotColor>,{" "}
                <InlineSpotColor varName="coefficientB" color="#8E90F5">b</InlineSpotColor>, and{" "}
                <InlineSpotColor varName="coefficientC" color="#F7B23B">c</InlineSpotColor>{" "}
                each control a different aspect of the parabola's shape and position.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    // Interactive formula with matching curve color and hover highlight
    <StackLayout key="layout-intro-interactive-formula" maxWidth="xl">
        <Block id="intro-interactive-formula" padding="md">
            <FormulaBlock
                latex="\highlight{fx}{f(x)} = \scrub{coefficientA}x^2 + \scrub{coefficientB}x + \scrub{coefficientC}"
                variables={scrubVarsFromDefinitions(["coefficientA", "coefficientB", "coefficientC"])}
                linkedHighlights={{
                    fx: {
                        varName: "introFormulaHighlight",
                        color: "#6366f1",
                        bgColor: "rgba(99, 102, 241, 0.2)",
                    },
                }}
            />
        </Block>
    </StackLayout>,

    // Interactive exploration
    <SplitLayout key="layout-intro-explore" ratio="1:1" gap="lg">
        <div className="space-y-4">
            <Block id="intro-explore-text" padding="sm">
                <EditableParagraph id="para-intro-explore-text" blockId="intro-explore-text">
                    The graph shows a parabola with{" "}
                    <InlineSpotColor varName="coefficientA" color="#62D0AD">a</InlineSpotColor> ={" "}
                    <InlineScrubbleNumber
                        varName="coefficientA"
                        {...numberPropsFromDefinition(getVariableInfo("coefficientA"))}
                    />,{" "}
                    <InlineSpotColor varName="coefficientB" color="#8E90F5">b</InlineSpotColor> ={" "}
                    <InlineScrubbleNumber
                        varName="coefficientB"
                        {...numberPropsFromDefinition(getVariableInfo("coefficientB"))}
                    />, and{" "}
                    <InlineSpotColor varName="coefficientC" color="#F7B23B">c</InlineSpotColor> ={" "}
                    <InlineScrubbleNumber
                        varName="coefficientC"
                        {...numberPropsFromDefinition(getVariableInfo("coefficientC"))}
                    />.
                </EditableParagraph>
            </Block>
            <Block id="intro-explore-instruction" padding="sm">
                <EditableParagraph id="para-intro-explore-instruction" blockId="intro-explore-instruction">
                    Drag the two teal points horizontally to widen or narrow the parabola. Pulling them apart makes the curve wider, pushing them together makes it steeper. Or drag the amber point on the y-axis to shift everything up and down.
                </EditableParagraph>
            </Block>
        </div>
        <Block id="intro-explore-viz" padding="sm" hasVisualization>
            <IntroParabolaViz />
        </Block>
    </SplitLayout>,
];
