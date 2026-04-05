import { C } from '../utils/ColorPalette';

export interface NPCDef {
  id:   string;
  name: string;
  tileX: number;   // tile position in VillageScene
  tileY: number;
  appearance: { skin: number; hair: number; shirt: number };
}

// Village NPCs — positions match VillageScene map layout
export const NPC_DEFS: NPCDef[] = [
  {
    id: 'mabel', name: 'Mabel',
    tileX: 15, tileY: 7,
    appearance: { skin: C.SKIN_TAN, hair: C.HAIR_WHITE, shirt: C.SHIRT_PURPLE },
  },
  {
    id: 'finn', name: 'Finn',
    tileX: 9, tileY: 6,
    appearance: { skin: C.SKIN_FAIR, hair: C.HAIR_BLONDE, shirt: C.SHIRT_GREEN },
  },
  {
    id: 'rosa', name: 'Rosa',
    tileX: 4, tileY: 7,
    appearance: { skin: C.SKIN_MEDIUM, hair: C.HAIR_DARK, shirt: C.SHIRT_RED },
  },
];
