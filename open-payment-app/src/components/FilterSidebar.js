import React, { useEffect, useState } from "react";

const useSpecialties = () => {
    const [specialties, setSpecialties] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSpecialties = async () => {
            try {
                const response = await fetch(
                    "http://localhost:3000/api/specialties"
                );
                if (!response.ok)
                    throw new Error("Failed to fetch specialties");

                const data = await response.json();
                setSpecialties(data.specialties || []);
            } catch (error) {
                console.error("Error fetching specialties:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchSpecialties();
    }, []);

    return { specialties, loading };
};

const FilterSidebar = ({ onFilterChange }) => {
    const { specialties, loading } = useSpecialties();
    const [selectedSpecialties, setSelectedSpecialties] = useState([]);

    const handleSpecialtyChange = (e) => {
        const { value, checked } = e.target;

        const updatedSpecialties = checked
            ? [...selectedSpecialties, value]
            : selectedSpecialties.filter((s) => s !== value);

        setSelectedSpecialties(updatedSpecialties);
        onFilterChange({ Physician_Specialty: updatedSpecialties });
    };

    return (
        <aside className="p-3 border-end bg-light">
            <h5>Filter</h5>
            <hr style={{ margin: "10px 0", border: "1px solid #083037" }} />
            <div className="mb-3">
                <label className="form-label">Specialty</label>
                <div style={{ maxHeight: "300px", overflowY: "auto" }}>
                    {loading ? (
                        <div>Loading...</div>
                    ) : (
                        specialties.map((specialty, index) => (
                            <div className="form-check" key={index}>
                                <input
                                    className="form-check-input"
                                    type="checkbox"
                                    value={specialty}
                                    id={`specialty-${index}`}
                                    checked={selectedSpecialties.includes(
                                        specialty
                                    )}
                                    onChange={handleSpecialtyChange}
                                />
                                <label
                                    className="form-check-label"
                                    htmlFor={`specialty-${index}`}
                                >
                                    {specialty}
                                </label>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </aside>
    );
};

export default FilterSidebar;
