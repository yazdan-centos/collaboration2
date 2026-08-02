import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import EmbeddedChat from '../../components/chat/EmbeddedChat';
import ServerAsyncSelect from '../../components/form/ServerAsyncSelect';
import ticketService from '../../services/ticketService';
import aghelifardAvatar from '../../assets/img/aghelifard.jpg';
import amirBagherpourAvatar from '../../assets/img/amir_bagherpour.jpg';
import gordaniAvatar from '../../assets/img/gordani.jpg';
import motaghianAvatar from '../../assets/img/motaghian.jpg';
import nematollahianAvatar from '../../assets/img/nematollahian.jpg';
import shahghasempourAvatar from '../../assets/img/shahghasempour.jpg';
import smhNajiAvatar from '../../assets/img/smh naji.jpg';

const CHAT_AVATARS = [
  aghelifardAvatar,
  amirBagherpourAvatar,
  gordaniAvatar,
  motaghianAvatar,
  nematollahianAvatar,
  shahghasempourAvatar,
  smhNajiAvatar,
];

function ticketAvatar(ticketId) {
  const numericId = Number(ticketId);
  const index = Number.isFinite(numericId)
    ? Math.abs(numericId) % CHAT_AVATARS.length
    : 0;
  return CHAT_AVATARS[index];
}

export default function TicketChatPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedTicketId = searchParams.get('ticketId') || '';
  const [selectedTicket, setSelectedTicket] = useState(null);

  useEffect(() => {
    let active = true;
    if (!selectedTicketId) {
      setSelectedTicket(null);
      return undefined;
    }

    ticketService.getOptionById(selectedTicketId)
      .then((option) => { if (active) setSelectedTicket(option); })
      .catch(() => { if (active) setSelectedTicket(null); });
    return () => { active = false; };
  }, [selectedTicketId]);

  function openTicket(event) {
    event.preventDefault();
    if (!selectedTicket?.ticketId) return;
    setSearchParams({ ticketId: selectedTicket.ticketId });
  }

  return (
    <section className="ticket-page ticket-chat-page">
      <div className="ticket-chat-whatsapp-shell animate-in delay-1">
        <aside className="ticket-chat-whatsapp-sidebar">
          <header className="ticket-chat-whatsapp-sidebar-header">
            <img src={CHAT_AVATARS[0]} alt="پروفایل کاربر" />
            <div>
              <strong>گفتگوی تیکت‌ها</strong>
              <span>پیام‌رسان پشتیبانی</span>
            </div>
            <i className="fas fa-comment-dots" aria-hidden="true" />
          </header>

          <form className="ticket-chat-whatsapp-search" onSubmit={openTicket}>
            <i className="fas fa-search" aria-hidden="true" />
            <div className="ticket-chat-select">
              <ServerAsyncSelect
                value={selectedTicket}
                onChange={setSelectedTicket}
                loadOptions={ticketService.searchOptions}
                getOptionValue={(option) => option.ticketId}
                placeholder="جستجوی عنوان تیکت یا مشتری..."
                noOptionsMessage="تیکتی پیدا نشد"
                aria-label="انتخاب تیکت"
              />
            </div>
            <button type="submit" disabled={!selectedTicket?.ticketId} aria-label="نمایش گفتگو">
              <i className="fas fa-arrow-left" />
            </button>
          </form>

          <div className="ticket-chat-whatsapp-list">
            {selectedTicketId && selectedTicket ? (
              <button type="button" className="ticket-chat-whatsapp-list-item active">
                <img src={ticketAvatar(selectedTicketId)} alt="" />
                <span>
                  <strong>
                    {selectedTicket.ticket?.title || selectedTicket.label || `تیکت #${selectedTicketId}`}
                  </strong>
                  <small>
                    {selectedTicket.ticket?.customerName || 'گفتگوی فعال تیکت'}
                  </small>
                </span>
                <time>اکنون</time>
              </button>
            ) : (
              <div className="ticket-chat-whatsapp-list-empty">
                <i className="far fa-comments" />
                <span>برای شروع گفتگو یک تیکت انتخاب کنید.</span>
              </div>
            )}
          </div>
        </aside>

        <main className="ticket-chat-whatsapp-main">
          {selectedTicketId ? (
            <EmbeddedChat
              key={selectedTicketId}
              ticketId={selectedTicketId}
              title={selectedTicket?.ticket?.title || selectedTicket?.label || 'گفتگوی تیکت'}
              subtitle={`تیکت #${selectedTicketId}`}
              avatar={ticketAvatar(selectedTicketId)}
              height="100%"
              variant="whatsapp"
            />
          ) : (
            <div className="ticket-chat-whatsapp-welcome">
              <div><i className="fas fa-comments" /></div>
              <h2>گفتگوی تیکت‌ها</h2>
              <p>تیکت موردنظر را از بخش جستجو انتخاب کنید تا تاریخچه پیام‌ها نمایش داده شود.</p>
            </div>
          )}
        </main>
      </div>
    </section>
  );
}
