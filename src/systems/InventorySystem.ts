import { EventBus } from '../utils/EventBus';
import { getItem, ItemDefinition } from '../data/items';
import { InventoryItemSave } from '../save/SaveSchema';

export interface InventorySlot {
  itemId: string | null;
  quantity: number;
}

export const INVENTORY_SIZE = 24;
export const HOTBAR_SIZE = 8;

export class InventorySystem {
  private slots: InventorySlot[];
  private selectedSlot = 0;

  constructor() {
    this.slots = Array.from({ length: INVENTORY_SIZE }, () => ({ itemId: null, quantity: 0 }));
  }

  // ── Accessors ──────────────────────────────────────────────────────────────

  get selectedItemId(): string | null {
    if (this.selectedSlot < 0 || this.selectedSlot >= INVENTORY_SIZE) return null;
    return this.slots[this.selectedSlot].itemId;
  }

  get selected(): InventorySlot {
    if (this.selectedSlot < 0 || this.selectedSlot >= INVENTORY_SIZE) return { itemId: null, quantity: 0 };
    return this.slots[this.selectedSlot];
  }

  getSlot(index: number): InventorySlot {
    return this.slots[index];
  }

  getAllSlots(): InventorySlot[] {
    return this.slots;
  }

  selectSlot(index: number): void {
    if (index >= -1 && index < INVENTORY_SIZE) {
      this.selectedSlot = index;
      EventBus.emit('inventory:changed', {});
    }
  }

  deselectAll(): void {
    this.selectedSlot = -1;
    EventBus.emit('inventory:changed', {});
  }

  getSelectedIndex(): number {
    return this.selectedSlot;
  }

  // ── Mutations ──────────────────────────────────────────────────────────────

  addItem(itemId: string, quantity = 1): boolean {
    const def = getItem(itemId);

    if (def.stackable) {
      // Try to stack on existing slot
      for (const slot of this.slots) {
        if (slot.itemId === itemId && slot.quantity < def.maxStack) {
          const canAdd = Math.min(quantity, def.maxStack - slot.quantity);
          slot.quantity += canAdd;
          quantity -= canAdd;
          if (quantity <= 0) {
            EventBus.emit('inventory:changed', {});
            return true;
          }
        }
      }
    }

    // Find empty slot
    const empty = this.slots.find(s => s.itemId === null);
    if (!empty) return false; // inventory full

    empty.itemId = itemId;
    empty.quantity = quantity;
    EventBus.emit('inventory:changed', {});
    return true;
  }

  removeItem(itemId: string, quantity = 1): boolean {
    let remaining = quantity;
    for (const slot of this.slots) {
      if (slot.itemId !== itemId) continue;
      const take = Math.min(remaining, slot.quantity);
      slot.quantity -= take;
      remaining -= take;
      if (slot.quantity === 0) slot.itemId = null;
      if (remaining <= 0) break;
    }
    EventBus.emit('inventory:changed', {});
    return remaining <= 0;
  }

  countItem(itemId: string): number {
    return this.slots
      .filter(s => s.itemId === itemId)
      .reduce((sum, s) => sum + s.quantity, 0);
  }

  hasItem(itemId: string, quantity = 1): boolean {
    return this.countItem(itemId) >= quantity;
  }

  swapSlots(a: number, b: number): void {
    if (a < 0 || a >= INVENTORY_SIZE || b < 0 || b >= INVENTORY_SIZE) return;
    const temp = this.slots[a];
    this.slots[a] = this.slots[b];
    this.slots[b] = temp;
    EventBus.emit('inventory:changed', {});
  }

  consumeSelectedItem(): void {
    if (this.selectedSlot < 0 || this.selectedSlot >= INVENTORY_SIZE) return;
    const slot = this.slots[this.selectedSlot];
    if (!slot.itemId) return;
    slot.quantity--;
    if (slot.quantity <= 0) {
      slot.itemId = null;
      slot.quantity = 0;
    }
    EventBus.emit('inventory:changed', {});
  }

  // ── Default tools (player always starts with these) ──────────────────────

  addStartingItems(): void {
    this.addItem('hoe');
    this.addItem('watering_can');
    this.addItem('turnip_seed', 6);
    this.addItem('carrot_seed', 4);
  }

  // ── Serialization ──────────────────────────────────────────────────────────

  serialize(): InventoryItemSave[] {
    return this.slots
      .map((slot, index) => ({ itemId: slot.itemId ?? '', quantity: slot.quantity, slotIndex: index }))
      .filter(s => s.itemId !== '');
  }

  deserialize(saves: InventoryItemSave[]): void {
    this.slots = Array.from({ length: INVENTORY_SIZE }, () => ({ itemId: null, quantity: 0 }));
    for (const s of saves) {
      if (s.slotIndex < INVENTORY_SIZE) {
        this.slots[s.slotIndex] = { itemId: s.itemId, quantity: s.quantity };
      }
    }
    // If all slots are empty (fresh game), add starting items
    if (saves.length === 0) this.addStartingItems();
    EventBus.emit('inventory:changed', {});
  }
}
