import * as React from "react"
import Svg, { Mask, Circle, G, Path } from "react-native-svg"
const SvgComponent = (props) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={75}
    height={75}
    fill="none"
    {...props}
  >
    <Mask
      id="a"
      width={75}
      height={75}
      x={0}
      y={0}
      maskUnits="userSpaceOnUse"
      style={{
        maskType: "alpha",
      }}
    >
      <Circle cx={37.5} cy={37.5} r={37} fill="#EDEDED" stroke="#ACACAC" />
    </Mask>
    <G mask="url(#a)">
      <Circle cx={37.5} cy={37.5} r={37.5} fill="#EDEDED" />
      <Circle
        cx={37.485}
        cy={31.717}
        r={11.252}
        fill="#D8D8D8"
        stroke="#D8D8D8"
        strokeWidth={4.93}
      />
      <Path
        fill="#D8D8D8"
        d="M57.58 53.729C54.707 48.624 52 45 49.603 46.072c-1.181.53-6.572 3.439-12.104 3.428-5.688-.011-10.93-2.957-12.5-3.428-3.097-.927-6.659 2.872-8.572 7.657-1.914 4.785-3.19 16.588-1.914 20.416 1.277 3.828 44.341 3.828 45.936 0 1.595-3.828 0-15.312-2.87-20.416Z"
      />
    </G>
  </Svg>
)
export default SvgComponent
