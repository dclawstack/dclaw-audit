# Troubleshooting

Common issues and solutions for DClaw Audit.

## Quick Diagnostics

```bash
# Check app pods
kubectl get pods -n dclaw-audit

# Check logs
kubectl logs -n dclaw-audit deployment/dclaw-audit-backend

# Check database
kubectl get clusters -n dclaw-audit
```

## Sections

- [Common Issues](./common-issues)
- [FAQ](./faq)
