# Parent sales test — September 11, 2026

Status: prepared, not sent. No spend, price change, payment collection or sales
claimed. Audience assumption pending founder choice: parents of children aged
4–6. Preserve existing free-access promises. This test measures interest and
use; it does not establish willingness to pay.

## One invitation, one real activity

Use individually with parents who have agreed to hear about Bloom. Ask community
organisers for permission before posting in their groups. Do not scrape or bulk
message parents. Founder approval of recipients and exact copy is required before
the assistant sends anything.

Draft:

> I’m Sanju, the parent building Bloom Juniors. I’m looking for a few families
> with a 4–6-year-old to try one activity together: move a torch and discover
> what changes a shadow. Bumi gives spoken guidance, and you can try it without
> creating an account. Would you be willing to try it and tell me one place
> your child needed help?
>
> https://bloomjuniors.com/play/shadow?utm_source=parent_invite&utm_medium=direct&utm_campaign=first_discovery_sep2026

After a parent agrees, ask for one sentence of feedback. Do not request a child's
name, photo, recording or diagnosis. No follow-up automation is enabled.

## Run and record

1. Invite up to 10 relevant families personally; this is a target, not traction.
2. Record invitations, replies and agreed trials in the sheet below. Use an
   anonymous family label. Keep contact details in the founder's existing private
   contact system, not Git.
3. Observe whether the child can begin and finish with the spoken guidance.
4. After the trial, ask: “What confused you, and would you choose to use this again?”
5. At the end of seven days, review the actual bottleneck. Low replies means
   revisiting the invitation/audience; unfinished trials means fixing the activity;
   completions without registration means reviewing the account value/entry;
   registration without return means reviewing the home/return journey.
6. Choose a paid offer only after reviewing responses and delivery costs. Confirm
   exactly what is included, the price, renewal/refund terms and how it differs
   from promised free access before adding checkout or presenting a paid offer.

| Family label | Invited | Replied | Tried | Finished | Registered (self-reported) | Returned (self-reported) | Objection / observation |
| --- | --- | --- | --- | --- | --- | --- | --- |
| F01 | | | | | | | |
| F02 | | | | | | | |
| F03 | | | | | | | |

## Measurement

Existing GA4 events now include sample_view, sample_start, sample_complete and
sample_account_click with sample = picnic, float or shadow. Homepage activity
cards emit sample_cta_click. Existing sign_up remains the successful account
creation event; an account click is not a registration or a sale.

View/start/complete are deduplicated per sample per browser session. Opening a
previously completed sample does not manufacture a new completion; its view has
already_complete=true. Campaign attribution is captured on direct sample entry.
No child names, email addresses, predictions or answers are added to these events.

Use the existing GA4 funnel exploration, filtered to this campaign and excluding
QA traffic. Use the existing founder dashboard for authenticated family return
data. Do not build a second dashboard. Browser verification checks event emission,
not receipt by GA4; blockers, consent settings and device changes can affect
counts. No measured conversion improvement is claimed yet.

Outstanding before promoting cross-device continuity: independently verify real
account login and cloud save. That check is still blocked by the absent connected
browser/test account in the current agent session.
