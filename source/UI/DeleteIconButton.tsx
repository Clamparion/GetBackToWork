import * as React from 'react';
import './styles.scss';

type Props = {
  onClick: React.MouseEventHandler<HTMLButtonElement>;
};

const DeleteIconButton: React.FC<Props> = ({onClick}: Props) => {
  return (
    <button
      type="button"
      className="flex-grow-0 self-end text-white focus:outline-none font-medium rounded-lg text-sm p-2.5 text-center inline-flex items-center mr-2 bg-orange-600 hover:bg-orange-700 focus:ring-orange-800"
      onClick={onClick}
    >
      <svg
        viewBox="0 -256 1792 1792"
        id="svg3741"
        version="1.1"
        className="w-5 h-5"
        fill="currentColor"
      >
        <g transform="matrix(1,0,0,-1,197.42373,1255.0508)" id="g3743">
          <path
            d="M 512,800 V 224 q 0,-14 -9,-23 -9,-9 -23,-9 h -64 q -14,0 -23,9 -9,9 -9,23 v 576 q 0,14 9,23 9,9 23,9 h 64 q 14,0 23,-9 9,-9 9,-23 z m 256,0 V 224 q 0,-14 -9,-23 -9,-9 -23,-9 h -64 q -14,0 -23,9 -9,9 -9,23 v 576 q 0,14 9,23 9,9 23,9 h 64 q 14,0 23,-9 9,-9 9,-23 z m 256,0 V 224 q 0,-14 -9,-23 -9,-9 -23,-9 h -64 q -14,0 -23,9 -9,9 -9,23 v 576 q 0,14 9,23 9,9 23,9 h 64 q 14,0 23,-9 9,-9 9,-23 z M 1152,76 v 948 H 256 V 76 Q 256,54 263,35.5 270,17 277.5,8.5 285,0 288,0 h 832 q 3,0 10.5,8.5 7.5,8.5 14.5,27 7,18.5 7,40.5 z M 480,1152 h 448 l -48,117 q -7,9 -17,11 H 546 q -10,-2 -17,-11 z m 928,-32 v -64 q 0,-14 -9,-23 -9,-9 -23,-9 h -96 V 76 q 0,-83 -47,-143.5 -47,-60.5 -113,-60.5 H 288 q -66,0 -113,58.5 Q 128,-11 128,72 v 952 H 32 q -14,0 -23,9 -9,9 -9,23 v 64 q 0,14 9,23 9,9 23,9 h 309 l 70,167 q 15,37 54,63 39,26 79,26 h 320 q 40,0 79,-26 39,-26 54,-63 l 70,-167 h 309 q 14,0 23,-9 9,-9 9,-23 z"
            id="path3745"
          />
        </g>
      </svg>
      <span className="sr-only">remove domain</span>
    </button>
  );
};

export default DeleteIconButton;
