import React, { FunctionComponent, ReactNode } from 'react';

interface Props {
  Icon: ReactNode,
  label: string,
  value?: string,
}

const WeatherCard: FunctionComponent<Props> = ({ Icon, label, value = '' }) => (
  <div className="weather-card">
    {Icon}
    <div className="info">
      <div className="label">{label}</div>
      <div className="value">{value}</div>
    </div>
  </div>
);

export default WeatherCard;
