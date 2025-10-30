// https://www.sanity.io/docs/structure-builder-cheat-sheet
export const structure = (S) =>
  S.list()
    .title('Content')
    .items([
      S.listItem()
        .title('Clubs')
        .child(
          S.documentList()
            .title('Clubs')
            .filter('_type == "club"')
        ),
      S.divider(),
      S.listItem()
        .title('Project Applications')
        .icon(() => '📋')
        .child(
          S.list()
            .title('Application Management')
            .items([
              S.listItem()
                .title('Pending Applications')
                .icon(() => '⏳')
                .child(
                  S.documentList()
                    .title('Pending Applications')
                    .filter('_type == "projectApplication" && status == "pending"')
                    .defaultOrdering([{ field: 'applicationDate', direction: 'desc' }])
                ),
              S.listItem()
                .title('Under Review')
                .icon(() => '👀')
                .child(
                  S.documentList()
                    .title('Applications Under Review')
                    .filter('_type == "projectApplication" && status == "reviewing"')
                    .defaultOrdering([{ field: 'applicationDate', direction: 'desc' }])
                ),
              S.listItem()
                .title('Accepted Applications')
                .icon(() => '✅')
                .child(
                  S.documentList()
                    .title('Accepted Applications')
                    .filter('_type == "projectApplication" && status == "accepted"')
                    .defaultOrdering([{ field: 'reviewDate', direction: 'desc' }])
                ),
              S.listItem()
                .title('All Applications')
                .icon(() => '📋')
                .child(
                  S.documentList()
                    .title('All Applications')
                    .filter('_type == "projectApplication"')
                    .defaultOrdering([{ field: 'applicationDate', direction: 'desc' }])
                ),
            ])
        ),
      S.divider(),
      S.listItem()
        .title('Members')
        .child(S.documentList().title('Members').filter('_type == "member"')),
      S.listItem()
        .title('Events')
        .child(S.documentList().title('Events').filter('_type == "event"')),
      S.listItem()
        .title('Projects')
        .icon(() => '🚀')
        .child(
          S.list()
            .title('Project Management')
            .items([
              S.listItem()
                .title('Active Projects')
                .icon(() => '⚡')
                .child(
                  S.documentList()
                    .title('Active Projects')
                    .filter('_type == "project" && status in ["active-seeking", "active-progress"]')
                    .defaultOrdering([{ field: 'status', direction: 'asc' }, { field: 'createdAt', direction: 'desc' }])
                ),
              S.listItem()
                .title('Proposed Projects')
                .icon(() => '📝')
                .child(
                  S.documentList()
                    .title('Proposed Projects')
                    .filter('_type == "project" && status == "proposed"')
                    .defaultOrdering([{ field: 'createdAt', direction: 'desc' }])
                ),
              S.listItem()
                .title('Completed Projects')
                .icon(() => '✅')
                .child(
                  S.documentList()
                    .title('Completed Projects')
                    .filter('_type == "project" && status == "completed"')
                    .defaultOrdering([{ field: 'createdAt', direction: 'desc' }])
                ),
              S.listItem()
                .title('All Projects')
                .icon(() => '📋')
                .child(
                  S.documentList()
                    .title('All Projects')
                    .filter('_type == "project"')
                    .defaultOrdering([{ field: 'createdAt', direction: 'desc' }])
                ),
            ])
        ),
      S.listItem()
        .title('Galleries')
        .child(S.documentList().title('Galleries').filter('_type == "gallery"')),
    ])

