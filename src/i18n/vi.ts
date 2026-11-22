export const vi = {
  appName: 'Gia phả',
  back: 'Quay lại',
  home: 'Trang chủ',
  settings: 'Cài đặt',
  close: 'Đóng',
  ok: 'OK',
  save: 'Lưu',
  loading: 'Đang tải…',
  comingSoon: 'Đang làm, sắp có nhé!',

  // home
  tree: 'Cây gia phả',
  treeHint: 'Xem các đời trong họ',
  calendar: 'Lịch âm dương',
  calendarHint: 'Ngày giỗ, sinh nhật',
  invite: 'Mời người thân',
  inviteHint: 'Gửi link qua Zalo, Messenger',

  // editing
  discardConfirm: 'Bỏ thay đổi chưa lưu?',
  keepEditing: 'Sửa tiếp',
  discard: 'Bỏ thay đổi',

  // settings
  bigText: 'Chữ to',
  language: 'Ngôn ngữ',
  on: 'Bật',
  off: 'Tắt',
  debug: 'Nhật ký lỗi',
  copyLogs: 'Chép nhật ký',
  copied: 'Đã chép!',
  clearLogs: 'Xoá',
} as const;

export type MessageKey = keyof typeof vi;
