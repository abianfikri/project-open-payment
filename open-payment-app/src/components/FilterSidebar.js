import React, { useEffect, useState } from "react";

const FilterSidebar = ({ onFilterChange }) => {
    const [specialties, setSpecialties] = useState([]);
    const [selectedSpecialties, setSelectedSpecialties] = useState([]);

    useEffect(() => {
        const fetchSpecialties = async () => {
            try {
                const response = await fetch(
                    "http://localhost:3000/api/open-payment?limit=1000"
                );
                if (!response.ok)
                    throw new Error("Network response was not ok");

                const data = await response.json();

                const uniqueSpecialties = [
                    ...new Set(
                        data.data.flatMap((item) =>
                            item.Physician_Specialty
                                ? item.Physician_Specialty.split("|").map((s) =>
                                      s.trim()
                                  )
                                : []
                        )
                    ),
                ];

                setSpecialties(uniqueSpecialties.sort());
            } catch (error) {
                console.error("Error fetching specialties:", error);
            }
        };

        fetchSpecialties();
    }, []);

    const handleCheckboxChange = (e) => {
        const value = e.target.value;
        const checked = e.target.checked;

        setSelectedSpecialties((prevSelected) => {
            const updated = checked
                ? [...prevSelected, value]
                : prevSelected.filter((s) => s !== value);

            onFilterChange({ Physician_Specialty: updated });
            return updated;
        });
    };

    return (
        <div className="p-3 border-end bg-light">
            <h5>Filter</h5>
            <hr style={{ margin: "10px 0", border: "1px solid #083037" }} />
            <div className="mb-3">
                <label className="form-label">Specialty</label>
                <div style={{ maxHeight: "300px", overflowY: "auto" }}>
                    {specialties.map((specialty, index) => (
                        <div className="form-check" key={index}>
                            <input
                                className="form-check-input"
                                type="checkbox"
                                value={specialty}
                                id={`specialty-${index}`}
                                checked={selectedSpecialties.includes(
                                    specialty
                                )}
                                onChange={handleCheckboxChange}
                            />
                            <label
                                className="form-check-label"
                                htmlFor={`specialty-${index}`}
                            >
                                {specialty}
                            </label>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default FilterSidebar;
