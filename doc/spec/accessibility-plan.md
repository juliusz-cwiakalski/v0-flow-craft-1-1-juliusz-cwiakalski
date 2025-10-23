# Accessibility Plan for Dashboard v1

## Current Limitations
- ARIA attributes are not fully implemented in dashboard cards and controls.
- Keyboard navigation is supported for all interactive elements, but some tooltips and custom controls lack explicit ARIA roles.
- Screen reader support is basic; some status messages and tooltips may not be announced.

## TODOs for Future Improvements
- Add ARIA roles and labels to all interactive dashboard elements and tooltips.
- Ensure all custom controls (date pickers, dropdowns) are fully keyboard accessible and screen reader friendly.
- Add focus indicators and skip links for improved navigation.
- Document accessibility coverage and known gaps in system specification.

## References
- [WAI-ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [React Accessibility Docs](https://react.dev/learn/accessibility)
