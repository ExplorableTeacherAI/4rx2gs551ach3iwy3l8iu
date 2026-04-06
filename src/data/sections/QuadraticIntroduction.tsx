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
    const COLOR_B = "#8E90F5"; // Indigo for 'b'
    const COLOR_C = "#F7B23B"; // Amber for 'c'
    const COLOR_CURVE = "#6366f1"; // Soft indigo for f(x) curve

    return (
        <div className="relative">
            <Cartesian2D
                height={350}
                viewBox={{ x: [-6, 6], y: [-6, 6] }}
                movablePoints={[
                    // Vertex point (teal - represents 'a' effect)
                    {
                        initial: [vertexX, vertexY],
                        color: COLOR_A,
                        position: [vertexX, vertexY],
                        constrain: "vertical",
                        onChange: (point) => {
                            const newY = point[1];
                            const newA = (newY - c) / (vertexX === 0 ? 1 : vertexX * vertexX);
                            if (Math.abs(newA) <= 3 && Math.abs(newA) >= 0.1) {
                                setVar("coefficientA", Math.round(newA * 2) / 2);
                            }
                        },
                    },
                    // Y-intercept point (amber - represents 'c')
                    {
                        initial: [0, c],
                        color: COLOR_C,
                        position: [0, c],
                        constrain: "vertical",
                        onChange: (point) => {
                            const newC = Math.round(point[1]);
                            if (newC >= -5 && newC <= 5) {
                                setVar("coefficientC", newC);
                            }
                        },
                    },
                ]}
                plots={[
                    // Main parabola curve
                    {
                        type: "function",
                        fn: (x: number) => a * x * x + b * x + c,
                        color: COLOR_CURVE,
                        weight: 3,
                    },
                    // Axis of symmetry (dashed)
                    {
                        type: "segment",
                        point1: [vertexX, -6],
                        point2: [vertexX, 6],
                        color: "#94a3b8",
                        weight: 1,
                        style: "dashed",
                    },
                    // Visual indicator connecting vertex to y-intercept
                    {
                        type: "segment",
                        point1: [vertexX, vertexY],
                        point2: [0, c],
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
                        gesture: "drag-vertical",
                        label: "Drag the teal vertex or amber y-intercept point",
                        position: { x: "50%", y: "45%" },
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

    // Interactive formula with matching curve color
    <StackLayout key="layout-intro-interactive-formula" maxWidth="xl">
        <Block id="intro-interactive-formula" padding="md">
            <FormulaBlock
                latex="\clr{fx}{f(x)} = \scrub{coefficientA}x^2 + \scrub{coefficientB}x + \scrub{coefficientC}"
                variables={scrubVarsFromDefinitions(["coefficientA", "coefficientB", "coefficientC"])}
                colorMap={{ fx: "#6366f1" }}
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
                    Drag the teal vertex point in the graph up and down, or scrub the values above. Watch how the parabola transforms as each coefficient changes. In the next sections, we'll explore exactly what each coefficient does.
                </EditableParagraph>
            </Block>
        </div>
        <Block id="intro-explore-viz" padding="sm" hasVisualization>
            <IntroParabolaViz />
        </Block>
    </SplitLayout>,
];
