// import { randGender } from "@ngneat/falso";
// import {
//   type ChangeEventHandler,
//   type FormEventHandler,
//   useCallback,
//   useState,
// } from "react";

// import { InputTextDropdown } from "../InputTextDropdown.js";

// const gender = [...new Array(20)].map(() => randGender());

// export default () => {
//   const handleSubmit = useCallback<FormEventHandler<HTMLFormElement>>((e) => {
//     e.preventDefault();
//     const formData = new FormData(e.currentTarget);
//     alert(JSON.stringify(Object.fromEntries(formData.entries()), null, 2));
//   }, []);

//   const handleChange = useCallback<ChangeEventHandler<HTMLInputElement>>(
//     (e) => {
//       setSearchTerm(e.currentTarget.value);
//     },
//     []
//   );

//   const [searchTerm, setSearchTerm] = useState<string>("");

//   return (
//     <InputTextDropdown
//       dxOffset={4}
//       dxPosition="bottom-left"
//       onChange={handleChange}
//       name="gender"
//     >
//       <ul>
//         {gender
//           .filter((g) => g.toLowerCase().includes(searchTerm.toLowerCase()))
//           .slice(0, 5)
//           .map((gender) => (
//             <li key={gender}>{gender}</li>
//           ))}
//       </ul>
//       <form onSubmit={handleSubmit}>
//         <input type="text" name="nested-form-input" />
//         <button type="submit">Submit</button>
//       </form>
//     </InputTextDropdown>
//   );
// };
