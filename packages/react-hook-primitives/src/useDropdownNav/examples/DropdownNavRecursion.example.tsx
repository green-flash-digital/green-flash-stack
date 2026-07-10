// import { DropdownNav } from "../DropdownNav.js";
// import { useDropdownNav } from "../dropdown-nav.useDropdownNav.js";

// type MenuTree = {
//   name: string;
//   root: string;
//   links: { display: string; to?: string; menu?: MenuTree }[];
// };
// const menuObjectTreeFetchedFromAnAPI: MenuTree = {
//   name: "level-1",
//   root: "/",
//   links: [
//     { display: "Home", to: "home" },
//     {
//       display: "Products",
//       menu: {
//         name: "level-2",
//         root: "/products",
//         links: [
//           { display: "doo dad", to: "doo-dad" },
//           {
//             display: "widgets",
//             menu: {
//               name: "level-3",
//               root: "/sample",
//               links: [
//                 { display: "Widget 1", to: "widget-1" },
//                 { display: "Widget 2", to: "widget-2" },
//                 { display: "Widget 3", to: "widget-3" },
//               ],
//             },
//           },
//           { display: "thing-a-ma-bob", to: "thing-a-ma-bob" },
//         ],
//       },
//     },
//     { display: "Pricing", to: "pricing" },
//     { display: "Blog", to: "blog" },
//   ],
// };

// function MenuTree({ menu, root }: { menu: MenuTree; root?: string }) {
//   const { targetProps, dropdownProps } = useDropdownNav({
//     dxPosition: "right-middle",
//   });

//   // build the base URL
//   let baseURL: string;
//   if (!root) {
//     baseURL = "/";
//   } else if (root === "/") {
//     baseURL = menu.root;
//   } else {
//     baseURL = root.concat(menu.root);
//   }

//   return menu.links.map((link) => {
//     // menu option has a href and should be rendered as a link
//     if (link.to) {
//       const href = `${baseURL === "/" ? "" : baseURL}/${link.to}`;
//       return (
//         <li key={link.display}>
//           <a href={href}>{link.display}</a>
//         </li>
//       );
//     }
//     // link has a menu, render a dropdown and recursively render the menu tree
//     if (link.menu) {
//       return (
//         <li key={link.display}>
//           <button {...targetProps}>{link.display}</button>
//           <DropdownNav {...dropdownProps}>
//             <ul>
//               <MenuTree menu={link.menu} root={baseURL} />
//             </ul>
//           </DropdownNav>
//         </li>
//       );
//     }
//     // no scenario here... this might be where you want to throw an error etc...
//     // an improvement on this structure would be to use a discriminated union and use a switch case type-guard
//     return null;
//   });
// }

// export default () => {
//   return (
//     <nav>
//       <ul>
//         <MenuTree menu={menuObjectTreeFetchedFromAnAPI} />
//       </ul>
//     </nav>
//   );
// };
