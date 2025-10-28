import {
  type HTTPHeaders,
  BaseAPI,
  JSONApiResponse,
  type InitOverrideFunction,
  Configuration,
} from 'twitter-openapi-typescript-generated';

export type TwitterListData = {
  data: {
    viewer: {
      list_management_timeline: {
        timeline: {
          instructions: TwitterListInstruction[];
        };
      };
    };
  };
};

export type TwitterListInstruction =
  | {
      type: 'TimelineClearCache';
    }
  | {
      type: 'TimelineTerminateTimeline';
      direction: 'Top' | 'Bottom';
    }
  | {
      type: 'TimelineAddEntries';
      entries: TwitterListTimelineEntry[];
    };

export type TwitterListTimelineEntry = {
  entryId: string;
  sortIndex: string;
  content: TwitterListTimelineEntryContent;
};

export type TwitterListTimelineEntryContent =
  | {
      entryType: 'TimelineTimelineModule';
      items: TwitterListTimelineModuleItem[];
      displayType: 'Vertical' | 'Horizontal';
      header: {
        displayType: string;
        text: string;
        sticky: boolean;
      };
      clientEventInfo?: {
        component: string;
        element: string;
        details: {
          timelinesDetails: {
            injectionType: 'OwnedSubscribedList' | 'ListToFollow';
          };
        };
      };
    }
  | {
      entryType: 'TimelineTimelineCursor';
    };

export type TwitterListTimelineModuleItem = {
  entryId: string;
  item: {
    itemContent: TwitterListTimelineModuleItemContent;
  };
};

export type TwitterListTimelineModuleItemContent =
  | {
      itemType: 'TimelineTwitterList';
      displayType: string;
      list: {
        created_at: number;
        custom_banner_media?: TwitterListMediaInfo;
        default_banner_media: TwitterListMediaInfo;
        description: string;
        facepile_urls: string[];
        followers_context: string;
        following: boolean;
        id: string;
        id_str: string;
        members: number;
        members_context: string;
        is_member: boolean;
        mode: 'Private' | 'Public';
        muting: boolean;
        name: string;
        pinning: boolean;
        subscriber_count: number;
        user_results: {
          rest_id: string;
          core: {
            name: string;
            screen_name: string;
          };
          avatar: {
            image_url: string;
          };
        };
      };
    }
  | {
      itemType: '';
      displayType: string;
    };

export type TwitterListMediaInfo = {
  media_info: {
    original_img_url: string;
    original_img_width: number;
    original_img_height: number;
    saleint_rect: {
      left: number;
      top: number;
      width: number;
      height: number;
    };
  };
};

const apiDocs =
  'https://raw.githubusercontent.com/fa0311/TwitterInternalAPIDocument/refs/heads/master/docs/json/API.json';

type ApiDocs = {
  graphql: Record<string, ApiEndpoint>;
};

type ApiEndpoint = {
  url: string;
  queryId: string;
  method: 'GET' | 'POST'; // Probably more but we don't use this internally
  features: Record<string, boolean>;
};

export async function createTwitterListAPI(config: Configuration) {
  const resp = await fetch(apiDocs);
  const json: ApiDocs = await resp.json();

  return new TwitterListAPI(config, json.graphql['ListsManagementPageTimeline']);
}

class TwitterListAPI extends BaseAPI {
  private readonly pathQueryId;
  private readonly features: Record<string, boolean>;

  constructor(config: Configuration, endpoint: ApiEndpoint) {
    super(config);

    this.pathQueryId = endpoint.queryId;
    this.features = endpoint.features;
  }

  async getListsRaw(initOverrides?: RequestInit | InitOverrideFunction) {
    const queryParameters = {
      variables: JSON.stringify({ count: 100 }),
      features: JSON.stringify(this.features),
    };

    const headerParameters: HTTPHeaders = {};

    if (this.configuration.apiKey) {
      headerParameters['Accept'] = await this.configuration.apiKey('Accept'); // Accept authentication

      headerParameters['x-twitter-client-language'] = await this.configuration.apiKey(
        'x-twitter-client-language',
      ); // ClientLanguage authentication

      headerParameters['Priority'] = await this.configuration.apiKey('Priority'); // Priority authentication

      headerParameters['Referer'] = await this.configuration.apiKey('Referer'); // Referer authentication

      headerParameters['Sec-Fetch-Dest'] =
        await this.configuration.apiKey('Sec-Fetch-Dest'); // SecFetchDest authentication

      headerParameters['Sec-Ch-Ua-Platform'] =
        await this.configuration.apiKey('Sec-Ch-Ua-Platform'); // SecChUaPlatform authentication

      headerParameters['Sec-Fetch-Mode'] =
        await this.configuration.apiKey('Sec-Fetch-Mode'); // SecFetchMode authentication

      headerParameters['x-csrf-token'] = await this.configuration.apiKey('x-csrf-token'); // CsrfToken authentication

      headerParameters['x-client-uuid'] =
        await this.configuration.apiKey('x-client-uuid'); // ClientUuid authentication

      if (this.configuration.accessToken) {
        const token = this.configuration.accessToken;
        const tokenString = await token('BearerAuth', []);

        if (tokenString) {
          headerParameters['Authorization'] = `Bearer ${tokenString}`;
        }
      }

      headerParameters['x-guest-token'] =
        await this.configuration.apiKey('x-guest-token'); // GuestToken authentication

      headerParameters['Sec-Ch-Ua'] = await this.configuration.apiKey('Sec-Ch-Ua'); // SecChUa authentication

      headerParameters['x-client-transaction-id'] = await this.configuration.apiKey(
        'x-client-transaction-id',
      ); // ClientTransactionId authentication

      headerParameters['x-twitter-active-user'] = await this.configuration.apiKey(
        'x-twitter-active-user',
      ); // ActiveUser authentication

      headerParameters['user-agent'] = await this.configuration.apiKey('user-agent'); // UserAgent authentication

      headerParameters['Accept-Language'] =
        await this.configuration.apiKey('Accept-Language'); // AcceptLanguage authentication

      headerParameters['Sec-Fetch-Site'] =
        await this.configuration.apiKey('Sec-Fetch-Site'); // SecFetchSite authentication

      headerParameters['x-twitter-auth-type'] =
        await this.configuration.apiKey('x-twitter-auth-type'); // AuthType authentication

      headerParameters['Sec-Ch-Ua-Mobile'] =
        await this.configuration.apiKey('Sec-Ch-Ua-Mobile'); // SecChUaMobile authentication

      headerParameters['Accept-Encoding'] =
        await this.configuration.apiKey('Accept-Encoding'); // AcceptEncoding authentication
    }

    const response = await this.request(
      {
        path: `/graphql/${this.pathQueryId}/ListsManagementPageTimeline`,
        method: 'GET',
        headers: headerParameters,
        query: queryParameters,
      },
      initOverrides,
    );

    return new JSONApiResponse(response, (jsonValue) => jsonValue as TwitterListData);
  }

  async getLists(initOverrides?: RequestInit | InitOverrideFunction) {
    const response = await this.getListsRaw(initOverrides);
    return await response.value();
  }
}

export default TwitterListAPI;
