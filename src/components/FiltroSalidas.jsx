import React from 'react';
import { Input, DatePicker, Space } from 'antd';

const { RangePicker } = DatePicker;

const FiltroSalidas = ({ searchText, setSearchText, selectedDates, setSelectedDates, onSearch }) => {

    // Manejar el cambio en la búsqueda y aplicar el filtro en tiempo real
    const handleSearchChange = (e) => {
        const value = e.target.value.toLowerCase();
        setSearchText(value);
        onSearch(value, selectedDates); // Aplica filtro en tiempo real
    };

    // Manejar cambio de fechas y aplicar filtro en tiempo real
    const handleDateChange = (dates) => {
        setSelectedDates(dates);
        onSearch(searchText, dates); // Aplica filtro en tiempo real
    };

    return (
        <Space>
            <Input
                placeholder="Buscar por código de producto..."
                onChange={handleSearchChange}
                value={searchText}
                className="w-60"
            />

            <RangePicker
                onChange={handleDateChange}
                value={selectedDates}
                className="w-72"
                format="YYYY-MM-DD"
            />
        </Space>
    );
};

export default FiltroSalidas;
