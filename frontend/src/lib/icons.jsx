import {
  LuArmchair, LuBaby, LuBath, LuBedDouble, LuCar, LuCoffee, LuCookingPot, LuFan, LuFlame, LuHeart, LuHouse, LuKey,
  LuLamp, LuMonitor, LuPlug, LuRefrigerator, LuShieldCheck, LuShirt, LuSnowflake, LuSofa, LuSparkles, LuTreePalm,
  LuTv, LuUtensils, LuWashingMachine, LuWifi, LuWind, LuUsers, LuPawPrint, LuCigaretteOff, LuWineOff, LuPartyPopper,
  LuZapOff, LuInfo,
} from 'react-icons/lu';

/** Icon keys usable in defaultContent.js for amenities. */
export const AMENITY_ICONS = {
  bed: LuBedDouble, bath: LuBath, kitchen: LuCookingPot, wifi: LuWifi, ac: LuSnowflake, fan: LuFan, tv: LuTv,
  fridge: LuRefrigerator, washing: LuWashingMachine, parking: LuCar, hotwater: LuFlame, dining: LuUtensils,
  sofa: LuSofa, home: LuHouse, shield: LuShieldCheck, sparkles: LuSparkles, heart: LuHeart, coffee: LuCoffee,
  baby: LuBaby, key: LuKey, plug: LuPlug, shirt: LuShirt, lamp: LuLamp, monitor: LuMonitor, wind: LuWind,
  palm: LuTreePalm, chair: LuArmchair,
};

export const RULE_ICONS = {
  family: LuUsers, pets: LuPawPrint, smoking: LuCigaretteOff, alcohol: LuWineOff, parties: LuPartyPopper,
  kitchen: LuCookingPot, power: LuZapOff, info: LuInfo,
};

export function AmenityIcon({ name, ...props }) {
  const Icon = AMENITY_ICONS[name] || LuSparkles;
  return <Icon aria-hidden="true" {...props} />;
}

export function RuleIcon({ name, ...props }) {
  const Icon = RULE_ICONS[name] || LuInfo;
  return <Icon aria-hidden="true" {...props} />;
}
