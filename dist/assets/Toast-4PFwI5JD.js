import{c as p,r as a,j as s}from"./index-C5x7ZBCo.js";import{F as u}from"./flame-CrBV5Ozx.js";import{T as n}from"./trophy-D6l0exo1.js";/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const f=p("CircleCheck",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"m9 12 2 2 4-4",key:"dzmm74"}]]);function g({message:c,type:t="success",duration:r=4e3,onDone:e}){const[i,o]=a.useState(!0);a.useEffect(()=>{const x=setTimeout(()=>{o(!1),setTimeout(()=>e==null?void 0:e(),300)},r);return()=>clearTimeout(x)},[r,e]);const l={success:s.jsx(f,{size:18}),pr:s.jsx(n,{size:18}),streak:s.jsx(u,{size:18})},m={success:"bg-green-500",pr:"bg-amber-500",streak:"bg-orange-500"};return s.jsxs("div",{className:`fixed top-4 left-1/2 -translate-x-1/2 z-[120] ${m[t]} text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2 font-semibold text-sm transition-all duration-300 ${i?"opacity-100 translate-y-0":"opacity-0 -translate-y-4"}`,children:[l[t]," ",c]})}export{g as T};
