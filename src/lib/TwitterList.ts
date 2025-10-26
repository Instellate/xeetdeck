import {
  HTTPHeaders,
  BaseAPI,
  JSONApiResponse,
  InitOverrideFunction,
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
    itemContent: {
      itemType: string;
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
            name: String;
            screen_name: String;
          };
          avatar: {
            image_url: string;
          };
        };
      };
    };
  };
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

class TwitterList extends BaseAPI {
  private readonly pathQueryId = 'VCF-Vdth4bblU5cwtKiyWg';

  async getListsRaw(initOverrides?: RequestInit | InitOverrideFunction) {
    const queryParameters: Record<string, string> = {
      variables: JSON.stringify({ count: 100 }),
      features: JSON.stringify({
        rweb_video_screen_enabled: false,
        payments_enabled: false,
        profile_label_improvements_pcf_label_in_post_enabled: true,
        responsive_web_profile_redirect_enabled: false,
        rweb_tipjar_consumption_enabled: true,
        verified_phone_label_enabled: false,
        creator_subscriptions_tweet_preview_api_enabled: true,
        responsive_web_graphql_timeline_navigation_enabled: true,
        responsive_web_graphql_skip_user_profile_image_extensions_enabled: false,
        premium_content_api_read_enabled: false,
        communities_web_enable_tweet_community_results_fetch: true,
        c9s_tweet_anatomy_moderator_badge_enabled: true,
        responsive_web_grok_analyze_button_fetch_trends_enabled: false,
        responsive_web_grok_analyze_post_followups_enabled: false,
        responsive_web_jetfuel_frame: true,
        responsive_web_grok_share_attachment_enabled: true,
        articles_preview_enabled: true,
        responsive_web_edit_tweet_api_enabled: true,
        graphql_is_translatable_rweb_tweet_is_translatable_enabled: true,
        view_counts_everywhere_api_enabled: true,
        longform_notetweets_consumption_enabled: true,
        responsive_web_twitter_article_tweet_consumption_enabled: true,
        tweet_awards_web_tipping_enabled: false,
        responsive_web_grok_show_grok_translated_post: false,
        responsive_web_grok_analysis_button_from_backend: true,
        creator_subscriptions_quote_tweet_preview_enabled: false,
        freedom_of_speech_not_reach_fetch_enabled: true,
        standardized_nudges_misinfo: true,
        tweet_with_visibility_results_prefer_gql_limited_actions_policy_enabled: true,
        longform_notetweets_rich_text_read_enabled: true,
        longform_notetweets_inline_media_enabled: true,
        responsive_web_grok_image_annotation_enabled: true,
        responsive_web_grok_imagine_annotation_enabled: true,
        responsive_web_grok_community_note_auto_translation_is_enabled: false,
        responsive_web_enhance_cards_enabled: false,
      }),
    };

    const headerParameters: HTTPHeaders = {};

    if (this.configuration.apiKey) {
      headerParameters['Accept'] = await this.configuration.apiKey('Accept'); // Accept authentication
    }

    if (this.configuration.apiKey) {
      headerParameters['x-twitter-client-language'] = await this.configuration.apiKey(
        'x-twitter-client-language',
      ); // ClientLanguage authentication
    }

    if (this.configuration.apiKey) {
      headerParameters['Priority'] = await this.configuration.apiKey('Priority'); // Priority authentication
    }

    if (this.configuration.apiKey) {
      headerParameters['Referer'] = await this.configuration.apiKey('Referer'); // Referer authentication
    }

    if (this.configuration.apiKey) {
      headerParameters['Sec-Fetch-Dest'] =
        await this.configuration.apiKey('Sec-Fetch-Dest'); // SecFetchDest authentication
    }

    if (this.configuration.apiKey) {
      headerParameters['Sec-Ch-Ua-Platform'] =
        await this.configuration.apiKey('Sec-Ch-Ua-Platform'); // SecChUaPlatform authentication
    }

    if (this.configuration.apiKey) {
      headerParameters['Sec-Fetch-Mode'] =
        await this.configuration.apiKey('Sec-Fetch-Mode'); // SecFetchMode authentication
    }

    if (this.configuration.apiKey) {
      headerParameters['x-csrf-token'] = await this.configuration.apiKey('x-csrf-token'); // CsrfToken authentication
    }

    if (this.configuration.apiKey) {
      headerParameters['x-client-uuid'] =
        await this.configuration.apiKey('x-client-uuid'); // ClientUuid authentication
    }

    if (this.configuration.accessToken) {
      const token = this.configuration.accessToken;
      const tokenString = await token('BearerAuth', []);

      if (tokenString) {
        headerParameters['Authorization'] = `Bearer ${tokenString}`;
      }
    }

    if (this.configuration.apiKey) {
      headerParameters['x-guest-token'] =
        await this.configuration.apiKey('x-guest-token'); // GuestToken authentication
    }

    if (this.configuration.apiKey) {
      headerParameters['Sec-Ch-Ua'] = await this.configuration.apiKey('Sec-Ch-Ua'); // SecChUa authentication
    }

    if (this.configuration.apiKey) {
      headerParameters['x-client-transaction-id'] = await this.configuration.apiKey(
        'x-client-transaction-id',
      ); // ClientTransactionId authentication
    }

    if (this.configuration.apiKey) {
      headerParameters['x-twitter-active-user'] = await this.configuration.apiKey(
        'x-twitter-active-user',
      ); // ActiveUser authentication
    }

    if (this.configuration.apiKey) {
      headerParameters['user-agent'] = await this.configuration.apiKey('user-agent'); // UserAgent authentication
    }

    if (this.configuration.apiKey) {
      headerParameters['Accept-Language'] =
        await this.configuration.apiKey('Accept-Language'); // AcceptLanguage authentication
    }

    if (this.configuration.apiKey) {
      headerParameters['Sec-Fetch-Site'] =
        await this.configuration.apiKey('Sec-Fetch-Site'); // SecFetchSite authentication
    }

    if (this.configuration.apiKey) {
      headerParameters['x-twitter-auth-type'] =
        await this.configuration.apiKey('x-twitter-auth-type'); // AuthType authentication
    }

    if (this.configuration.apiKey) {
      headerParameters['Sec-Ch-Ua-Mobile'] =
        await this.configuration.apiKey('Sec-Ch-Ua-Mobile'); // SecChUaMobile authentication
    }

    if (this.configuration.apiKey) {
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

export default TwitterList;
