export function useExportStyleGuide() {
  function exportStyleGuide() {
    window.print();
  }
  return { exportStyleGuide };
}
