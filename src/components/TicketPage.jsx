import React from 'react'
import { usePagination } from './data-list/usePagination'
import Pagination from './data-list/Pagination'
import DataList from './data-list/DataList'

export default function TicketPage() {

const PAGE_SIZE = 10;

// inside the component
const { page, pageData, visibleStart, visibleEnd, resetPage, goPrev, goNext, setResponse } =
  usePagination(PAGE_SIZE);

const columns = [
  {
    key: 'title',
    header: 'عنوان',
    render: (t) => (
      <div className="task-title-cell">
        <span className="task-name">{t.title || 'بدون عنوان'}</span>
        {t.description && <span className="task-desc">{t.description}</span>}
      </div>
    ),
  },
  { key: 'status', header: 'وضعیت', render: (t) => renderStatus(t) },
  { key: 'priority', header: 'اولویت', hidden: !showTriage, render: renderPriority },
  { key: 'customer', header: 'مشتری', hidden: !showManagement, render: renderCustomer },
  { key: 'assignee', header: 'مسئول', hidden: !showManagement, render: renderAssignee },
  { key: 'actions', header: 'عملیات', hidden: !showManagement, render: renderActions },
  { key: 'createdAt', header: 'تاریخ ایجاد', cellClassName: 'ticket-date fa-num',
    render: (t) => formatDate(t.createdAt) },
];

// after fetch: setResponse(await ticketService.searchTickets(filters, { page, size: PAGE_SIZE }))
// on search/filter change: resetPage()

return (
  <>
    <DataList
      columns={columns}
      rows={pageData.content}
      selectedKey={selectedTicketId}
      onRowClick={(t) => setSelectedTicketId(t.id)}
      isLoading={isLoading}
      tableClassName="task-table ticket-table"
    />

    <Pagination
      pageData={pageData}
      pageSize={PAGE_SIZE}
      visibleStart={visibleStart}
      visibleEnd={visibleEnd}
      onPrev={goPrev}
      onNext={goNext}
      isLoading={isLoading}
    />
  </>
);
}
