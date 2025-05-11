import {createApi, fetchBaseQuery} from "@reduxjs/toolkit/dist/query/react";
import {host} from "shared/config/constants";
import {QuestionModel} from "entities/QuestionModel";
import {AnswerModel} from "entities/AnswerModel";

export const messageAPI = createApi({
    reducerPath: 'messageAPI',
    baseQuery: fetchBaseQuery({
        baseUrl: `${host}/api`,
    }),
    tagTypes: ['user'],
    endpoints: (build) => ({
        ask: build.mutation<AnswerModel, QuestionModel>({
            query: (msg) => ({
                url: `/ask_ai?question=${msg.question}`,
                method: 'GET',
            }),
            invalidatesTags: ['user']
        }),
    })
});
