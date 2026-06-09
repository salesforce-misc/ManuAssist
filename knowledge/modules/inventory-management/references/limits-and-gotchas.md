# Inventory Management — Limits & Gotchas

Constraints, common pitfalls, troubleshooting, and best practices for the Manufacturing Cloud
inventory data model and Inventory Search and Transfer experience.

---

## Common Pitfalls

- **Forgetting to run the Update Product Inventory Searchable Field Values DPE** — search returns
  stale or no results. This is the #1 source of "search is broken" tickets.
- **Setting up the search component without the Searchable Object Configuration** — results are empty
- **Configuring `ProductTransfer` without `ProductTransferState` for serialized products** — serial
  state inconsistent across locations
- **Allowing manual updates to `ProductItemTransaction`** — it's auto-generated; manual edits corrupt
  the audit trail
- **Mismatched `QuantityUnitOfMeasure` between `ProductItem` and `Product2`** — search and aggregation
  break

---

## DPE Population Gotchas (`UpdateProductInventorySearchableFieldValues`)

- **Orphan ProductItem dropouts** — if `ProductItem.Product2Id` or `ProductItem.LocationId` points
  to a deleted or missing record, the DPE silently excludes that ProductItem from search results
  (driven by inner joins on Product2 and Location). Audit ProductItem integrity periodically.
- **Stale `ProductInvSearchableField` rows after ProductItem deletion** — the DPE only
  inserts/updates; it does **not delete** PISF rows when the underlying `ProductItem` is deleted.
  Stale rows must be cleaned up manually or via a separate scheduled job.
- **`TotalQuantityAtLocation` is not aggregated** — it's copied directly from
  `ProductItem.QuantityOnHand`. There is no roll-up across `ProductBatchItem` or `SerializedProduct`
  children inside the DPE. Roll-up must already be reflected on the `ProductItem` record itself.
- **No filter on the DPE** — every qualifying ProductItem is included as-is. There is no Active
  flag, quantity threshold, or status gate. To exclude specific records, manage them upstream
  (e.g., delete the ProductItem or break the Product2/Location reference).

---

## Hard Rules

- DPE must run on a schedule, not ad-hoc — search staleness is the most common ticket
- `ProductItemTransaction` is auto-generated — never edit manually
- `ProductTransfer` updates source/destination `ProductItem` only when `Status = 'Completed'`
- For serialized goods, `ProductTransferState` records must be created — otherwise serial state is
  inconsistent
- `Product2.QuantityUnitOfMeasure` and `ProductItem.QuantityUnitOfMeasure` must match for aggregation
  to work

---

## Troubleshooting

| Issue | Likely Cause | Fix |
|-------|--------------|-----|
| Inventory Search returns no results | DPE never run, or search component missing search config | Run DPE; verify Search Criteria Configuration linked on component |
| Search returns stale results | DPE not scheduled / not running on cadence | Schedule DPE daily or hourly |
| Search criteria dropdown empty | Criteria field mapping missing | Add mapping in Searchable Object Configuration |
| Result columns missing | Result field mapping missing or wrong source field | Re-map in Searchable Object Configuration |
| Product Transfer button missing | Search Action Configuration not linked or wrong action type | Reattach to Search Criteria Configuration as Search Result Action |
| ProductItemTransaction count = 0 | Object permissions missing on ProductItemTransaction | Grant read on ProductItemTransaction |
| Transfer doesn't update destination ProductItem | Transfer not Completed; or no ProductItem at destination | Mark transfer Completed; create ProductItem at destination |
| Serialized product status stuck | SerializedProductTransaction not created on transfer | Verify ProductTransferState records get created on transfer |
| QuantityOnHand goes negative | Manual edits + concurrent consumption | Lock manual edits; rely on transactions |
| Return Order line item rejected | Quantity > original WOLI/Claim coverage payment detail quantity | Reduce return quantity |
| Aggregation returns "Other" everywhere | Source field is null on most records | Backfill source fields (e.g., set Inventory Location Type on Locations) |
| Multi-location search slow | Searchable Object Configuration over-indexed | Trim criteria/result fields to those actually used |

---

## Best Practices

- Run the Inventory Searchable Field DPE on a schedule (daily minimum) — ad-hoc runs are not enough
- Standardize Inventory Location Type values org-wide (Distributor Standard Inventory, Vendor
  Standard Inventory, Customer Site, Van, etc.)
- Never let users update `ProductItemTransaction` manually — it's auto-generated
- Use `ProductTransfer` instead of direct edits to `ProductItem.QuantityOnHand` so the audit trail
  stays clean
- Use `Shipment` for in-transit visibility to catch reconciliation issues early
- Audit `ProductItem.QuantityOnHand` against physical counts via `inventory-count` regularly
- Keep `Product2.QuantityUnitOfMeasure` consistent with `ProductItem.QuantityUnitOfMeasure` to avoid
  aggregation breakage
- Trim Search Criteria/Result fields to those actually used — over-indexing slows multi-location
  search
