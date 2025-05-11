import ruRU from "antd/locale/ru_RU";
import {FC} from "react";
import {ConfigProvider} from "antd";

const AntdProvider: FC = ({children}) => {
    return (
        <ConfigProvider
            locale={ruRU}
            theme={{
                components: {
                    Table: {
                        cellPaddingInline: 0,
                        cellPaddingBlock: 0
                    }
                }
            }}
        >
            {children}
        </ConfigProvider>
    )
}

export default AntdProvider;