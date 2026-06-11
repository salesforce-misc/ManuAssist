# Inventory Management — Overview

Inventory Management gives manufacturers and their service teams near real-time visibility into
product and part inventory across warehouses, distribution lots, vans, and customer sites. It
powers transfers, returns, consumption tracking, and the inventory search experience built on
Manufacturing Cloud's data model.

> This module covers the **inventory data model and search experience**. For allocation/reservation,
> see `inventory-allocation`. For physical counts, see `inventory-count`.

---

## What's Covered

| Capability | Purpose |
|------------|---------|
| **Inventory Data Model** | Standard objects modeling stock, transactions, transfers, returns, serialized goods |
| **Inventory Search & Transfer (Criteria-Based Search and Filter)** | Configurable search experience powered by `ProductInvSearchableField` + the managed `UpdateProductInventorySearchableFieldValues` DPE; gated by the **Criteria Based Search And Filter** org pref + **Inventory Search And Transfer** PSL |
| **Product Item Transactions** | Auto-generated audit trail of inventory actions |
| **Serialized Inventory** | Track unique serial numbers across locations |
| **Product Transfer** | Move inventory between locations |
| **Shipments** | In-transit visibility |
| **Return Orders** | Repair / return / recall flow |
| **Product Required / Product Consumed** | Work-order-driven inventory consumption |

---

## Where to Look Next

| If you want... | Read |
|----------------|------|
| Data model, key objects, search architecture | `references/concepts-and-architecture.md` |
| Step-by-step setup (enable, locations, search & transfer, DPE) | `references/create-and-configure.md` |
| Runtime flows, validation checklist, SOQL | `references/run-and-monitor.md` |
| Constraints, troubleshooting, best practices | `references/limits-and-gotchas.md` |

---

## Related Modules

- **Inventory Allocation** — reserve product items for sales orders / work orders
- **Inventory Count** — physical inventory counts and variance reconciliation
- **Asset Service Lifecycle** — work orders consume inventory, parts return uses ReturnOrder
- **Sales Agreements** — committed quantities reference Product2 (no direct inventory link)
- **Product Portfolio** — Product2 setup the inventory data model hangs off of
