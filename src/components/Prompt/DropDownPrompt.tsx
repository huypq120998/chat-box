import { useEffect, useRef, useState } from "react";
import Select from "react-select";

interface Props {
    className?: string;
    onClick: () => void;
    disabled?: boolean;
}
export const DropDownPrompt = ({ optionsPrompt, setPromptSelected, promptSelected }: any) => {

    const [selectedOption, setSelectedOption] = useState("none");
    const handleSelectChange = (selected: any | null) => {
        setSelectedOption(selected)
        setPromptSelected(selected)
    };
    useEffect(() => {
        setSelectedOption(promptSelected)
    }, [promptSelected])
    return (
        <>
            <Select
                value={selectedOption}
                options={optionsPrompt}
                onChange={handleSelectChange}
                placeholder={"Chọn Prompt...."}
                isMulti={false}
                isClearable
                theme={(theme) => ({
                    ...theme,
                    borderRadius: 0,
                    colors: {
                        ...theme.colors,
                        primary25: '#f5f5f5',
                        primary: '#575757',
                    },
                })}
                styles={{
                    control: base => ({
                        ...base,
                    //    fontSize: '14px',
                    }),
                    option: base => ({
                        ...base,
                    //    fontSize: '14px',
                    }),
                }}
            />
        </>
    )
};

