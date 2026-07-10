// import { DropdownNav } from "../DropdownNav.js";
// import { useDropdownNav } from "../dropdown-nav.useDropdownNav.js";

// function NavMenuNested() {
//   const { targetProps, dropdownProps } = useDropdownNav({
//     dxPosition: "right-middle",
//   });

//   return (
//     <li>
//       <button {...targetProps}>Widgets</button>
//       <DropdownNav {...dropdownProps}>
//         <ul>
//           <li>
//             <a href="/products/sample/widget-2">Widget 1</a>
//           </li>
//           <li>
//             <a href="/products/sample/widget-2">Widget 2</a>
//           </li>
//           <li>
//             <a href="/products/sample/widget-3">Widget 3</a>
//           </li>
//         </ul>
//       </DropdownNav>
//     </li>
//   );
// }

// export default () => {
//   const { targetProps, dropdownProps } = useDropdownNav({
//     dxPosition: "right-middle",
//   });

//   return (
//     <nav>
//       <ul>
//         <li>
//           <a href="/">Home</a>
//         </li>
//         <li>
//           <button {...targetProps}>Products</button>
//           <DropdownNav {...dropdownProps}>
//             <ul>
//               <li>
//                 <a href="/products/sample">Sample</a>
//               </li>
//               <NavMenuNested />
//             </ul>
//           </DropdownNav>
//         </li>
//         <li>
//           <a href="/pricing">Pricing</a>
//         </li>
//       </ul>
//     </nav>
//   );
// };
