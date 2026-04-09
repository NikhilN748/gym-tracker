import{c,r as t,j as e}from"./index-C5x7ZBCo.js";/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const m=c("X",[["path",{d:"M18 6 6 18",key:"1bl5f8"}],["path",{d:"m6 6 12 12",key:"d8bk6v"}]]);function u({isOpen:a,onClose:s,title:l,children:d,size:o="md"}){if(t.useEffect(()=>(a?document.body.style.overflow="hidden":document.body.style.overflow="",()=>{document.body.style.overflow=""}),[a]),t.useEffect(()=>{if(!a)return;const r=n=>{n.key==="Escape"&&s()};return window.addEventListener("keydown",r),()=>window.removeEventListener("keydown",r)},[a,s]),!a)return null;const i={sm:"max-w-sm",md:"max-w-md",lg:"max-w-lg",xl:"max-w-xl",full:"max-w-full mx-4"};return e.jsxs("div",{className:"fixed inset-0 z-[100] flex items-end sm:items-center justify-center",onClick:s,children:[e.jsx("div",{className:"absolute inset-0 bg-black/50 backdrop-blur-sm"}),e.jsxs("div",{className:`relative w-full ${i[o]} bg-white dark:bg-gray-900 rounded-t-3xl sm:rounded-2xl shadow-2xl max-h-[85vh] flex flex-col animate-slide-up`,onClick:r=>r.stopPropagation(),role:"dialog","aria-modal":"true","aria-label":l,children:[e.jsx("div",{className:"flex justify-center pt-3 sm:hidden",children:e.jsx("div",{className:"w-10 h-1 rounded-full bg-gray-300 dark:bg-gray-700"})}),e.jsxs("div",{className:"flex items-center justify-between px-5 py-3 border-b border-gray-200 dark:border-gray-800",children:[e.jsx("h3",{className:"text-lg font-bold",children:l}),e.jsx("button",{onClick:s,className:"p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors",id:"modal-close-btn","aria-label":"Close dialog",children:e.jsx(m,{size:20})})]}),e.jsx("div",{className:"overflow-y-auto flex-1 p-5",children:d})]}),e.jsx("style",{children:`
        @keyframes slide-up {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-slide-up { animation: slide-up 0.3s ease-out; }
      `})]})}export{u as M,m as X};
