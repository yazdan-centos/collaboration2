import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import EmbeddedChat from '../components/chat/EmbeddedChat';

export default function TicketChatPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedTicketId = searchParams.get('ticketId') || '';
  const [ticketId, setTicketId] = useState(selectedTicketId);

  function openTicket(event) {
    event.preventDefault();
    const normalizedId = ticketId.trim();
    if (!/^\d+$/.test(normalizedId)) return;
    setSearchParams({ ticketId: normalizedId });
  }

  return (
    <section className="ticket-page">
      <div className="panel animate-in delay-1">
        <div className="panel-header">
          <div>
            <div className="panel-title">گفتگوی تیکت</div>
            <div className="team-results-count">شناسه تیکت را برای مشاهده پیام‌ها وارد کنید.</div>
          </div>
          <form className="panel-actions ticket-toolbar" onSubmit={openTicket}>
            <label className="team-search">
              <i className="fas fa-ticket" aria-hidden="true" />
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]+"
                value={ticketId}
                onChange={(event) => setTicketId(event.target.value)}
                placeholder="شناسه تیکت"
                aria-label="شناسه تیکت"
                required
              />
            </label>
            <button type="submit" className="filter-btn active" disabled={!/^\d+$/.test(ticketId.trim())}>
              نمایش گفتگو
            </button>
          </form>
        </div>

        {selectedTicketId ? (
          <EmbeddedChat key={selectedTicketId} ticketId={selectedTicketId} height="min(620px, calc(100vh - 260px))" />
        ) : (
          <div className="team-empty compact">
            <i className="fas fa-comments" aria-hidden="true" />
            <span>هنوز تیکتی انتخاب نشده است.</span>
          </div>
        )}
      </div>
    </section>
  );
}
