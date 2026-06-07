import { formatTime } from "../utils";

export default function RecordList({ items, emptyText, renderMeta, renderExtra }) {
  if (!items.length) {
    return <div className="empty-state">{emptyText}</div>;
  }

  return (
    <div className="record-list">
      {items.map((item) => (
        <article key={item.id} className="record-card">
          <div className="record-top">
            <span className="record-tag">{item.category}</span>
            <span className="record-time">{formatTime(item.updated_at)}</span>
          </div>
          <h3>{item.name}</h3>
          <p className="record-location">{item.location || "-"}</p>
          <p className="record-summary">{item.summary}</p>
          {renderMeta ? <div className="record-meta">{renderMeta(item)}</div> : null}
          {renderExtra ? <div className="record-extra">{renderExtra(item)}</div> : null}
        </article>
      ))}
    </div>
  );
}
