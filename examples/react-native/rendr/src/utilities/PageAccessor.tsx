import { isObject } from "lodash";
import {
    PageData,
} from "../interfaces/Page";

export interface PageAccessorPropsInterface {
    PageAccessor: PageAccessorInterface;
}

export interface PageAccessorInterface {
    fetchPage: (
        url: string
    ) => Promise<PageData>;
}

const PageAccessor: PageAccessorInterface = {
    fetchPage(uri: string) {
        return fetch(`https://nextjs-with-remoteapi.rande.now.sh/api/${uri}`)
            .then(res => {
                if (res.status === 404) {
                    alert(`${uri}: Page not found`);
                }

                return res.json();
            })
            .then(json => {
                if (!isObject(json)) {
                    alert(`Page not found`);
                }
                const data: any = json;

                return data;
            })
            .catch(err => {
                alert(err)
            });
    }
};

export default PageAccessor;
