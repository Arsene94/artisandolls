"use client";

import {
    IconBodyScan,
    IconBox,
    IconBrush,
    IconCamera,
    IconCertificate,
    IconCircle,
    IconCrown,
    IconHanger,
    IconEye,
    IconHandFinger,
    IconPalette,
    IconRulerMeasure,
    IconScale,
    IconScissors,
    IconShieldCheck,
    IconSparkles,
    IconStars,

} from "@tabler/icons-react";

const iconMap = {
    "body-scan": IconBodyScan,
    box: IconBox,
    brush: IconBrush,
    camera: IconCamera,
    certificate: IconCertificate,
    circle: IconCircle,
    crown: IconCrown,
    hanger: IconHanger,
    eye: IconEye,
    palette: IconPalette,
    "hand-finger": IconHandFinger,
    "ruler-measure": IconRulerMeasure,
    scale: IconScale,
    scissors: IconScissors,
    "shield-check": IconShieldCheck,
    sparkles: IconSparkles,
    stars: IconStars,
};

type CustomizationIconProps = {
    name?: string | null;
    color?: string | null;
    size?: number;
    className?: string;
};

export default function CustomizationIcon({
                                              name,
                                              color,
                                              size = 18,
                                              className,
                                          }: CustomizationIconProps) {
    const Icon = iconMap[(name ?? "circle") as keyof typeof iconMap] ?? IconCircle;

    return (
        <Icon
            size={size}
            stroke={1.8}
            className={className}
            style={color ? { color } : undefined}
            aria-hidden="true"
        />
    );
}

export const customizationIconOptions = [
    "sparkles",
    "eye",
    "palette",
    "body-scan",
    "ruler-measure",
    "scale",
    "brush",
    "scissors",
    "hand-finger",
    "stars",
    "shield-check",
    "camera",
    "box",
    "certificate",
    "circle",
] as const;
