"use client";

import Link from "next/link";
import { useState } from "react";
// import hamburger from "../../public/hamburger.svg";
// import { useCopyToClipboard } from "usehooks-ts";
// import toast from "react-hot-toast";

export default function Header() {
  const [open, setOpen] = useState(false);
  // const [, copy] = useCopyToClipboard();

  return (
    <div className="text-white bg-red-500">
      HEADER
      {/* <div
        onClick={() => setOpen(!open)}
        className="md:hidden flex justify-end"
      >
        <Image src={hamburger} height={25} width={25} alt="Hamburger Menu" />
      </div> */}
      {/* onClick=
      {() => {
        copy("0x2858E541f108161aC2A9ba301f52F515BeEBa3C3");
        toast.success("Copied!");
      }} */}
      {open && (
        <div className="fixed top-0 left-0 bottom-0 right-0 h-full w-full bg-white shadow-md z-20">
          <div
            onClick={() => setOpen(!open)}
            className="text-black text-2xl flex justify-end pr-10 pt-5"
          >
            <p>X</p>
          </div>
          <ul className="flex flex-col space-y-10 py-10 px-5">
            <li className="font-normal text-xl text-black">
              <Link
                href={process.env.NEXT_PUBLIC_DEXS_URL || "#"}
                target="_blank"
              >
                Discovery
              </Link>
            </li>
            <li className="font-normal text-xl text-black">
              <Link
                href={process.env.NEXT_PUBLIC_DEX_URL || "#"}
                target="_blank"
              >
                About $BMoney
              </Link>
            </li>
            <li className="font-normal text-xl text-black">
              <Link
                href={process.env.NEXT_PUBLIC_TELE_URL || "#"}
                target="_blank"
              >
                TELEGRAM
              </Link>
            </li>

            <li className="font-normal text-xl text-black">
              <Link href={process.env.NEXT_PUBLIC_X_URL || "#"} target="_blank">
                TWITTER
              </Link>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
