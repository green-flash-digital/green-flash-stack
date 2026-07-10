export const IconLock01 = ({
  dxSize = 24,
  ...restProps
}: React.SVGProps<SVGSVGElement> & { dxSize: number }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width={dxSize}
    height={dxSize}
    color={"currentColor"}
    fill={"none"}
    {...restProps}
  >
    <path
      d="M6 10V8C6 4.68629 8.68629 2 12 2C15.3137 2 18 4.68629 18 8V10"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    ></path>
    <path
      d="M12 15V17"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    ></path>
    <path
      d="M3 15C3 12.1716 3 10.7574 3.87868 9.87868C4.75736 9 6.17157 9 9 9H15C17.8284 9 19.2426 9 20.1213 9.87868C21 10.7574 21 12.1716 21 15C21 17.8284 21 19.2426 20.1213 20.1213C19.2426 21 17.8284 21 15 21H9C6.17157 21 4.75736 21 3.87868 20.1213C3 19.2426 3 17.8284 3 15Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
    ></path>
  </svg>
);
