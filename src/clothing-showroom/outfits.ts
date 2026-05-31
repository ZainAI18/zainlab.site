export type CuratedLook = {
  id: string;
  number: string;
  name: string;
  accent: string;
  fabric: string;
  trim: string;
  shoe: string;
  description: string;
  modelPath: string;
  type: "full-model";
};

export const defaultModelPath = "/models/3d-1.glb";

export const curatedLooks: CuratedLook[] = [
  {
    id: "dark-futurism",
    number: "01",
    name: "Dark Minimalism",
    accent: "#0b0d10",
    fabric: "#050505",
    trim: "#5f6670",
    shoe: "#070707",
    description: "Futuristic Techwear System",
    modelPath: "/models/Dark Futurism.glb",
    type: "full-model",
  },
  {
    id: "motor-sport",
    number: "02",
    name: "Motor Sport",
    accent: "#11141a",
    fabric: "#050608",
    trim: "#7f8999",
    shoe: "#080a0f",
    description: "Cyber Racing Fashion System",
    modelPath: "/models/cyber motorsport.glb",
    type: "full-model",
  },
  {
    id: "polar-x",
    number: "03",
    name: "POLAR-X",
    accent: "#d7dde5",
    fabric: "#101419",
    trim: "#9ba8b6",
    shoe: "#111820",
    description: "Arctic Techwear System",
    modelPath: "/models/POLAR-X.glb",
    type: "full-model",
  },
  {
    id: "west-coast-luxury-streetwear",
    number: "04",
    name: "West Coast Luxury Streetwear",
    accent: "#17110d",
    fabric: "#070707",
    trim: "#9a8470",
    shoe: "#0b0a09",
    description: "Premium Streetwear System",
    modelPath: "/models/West Coast Luxury Streetwear.glb",
    type: "full-model",
  },
];
