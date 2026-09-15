from django.urls import path

from app.apps.facility.views import (
    CheckInView,
    FacilityDetailView,
    FacilityListCreateView,
    FinishUseView,
    NoShowView,
    ReservationCancelView,
    ReservationListCreateView,
    SlotCloseView,
    SlotListCreateView,
)

urlpatterns = [
    # 设施维护
    path('facilities/', FacilityListCreateView.as_view()),
    path('facilities/<int:facility_id>/', FacilityDetailView.as_view()),
    # 开放时段
    path('slots/', SlotListCreateView.as_view()),
    path('slots/<int:slot_id>/close/', SlotCloseView.as_view()),
    # 预约与核销
    path('reservations/', ReservationListCreateView.as_view()),
    path('reservations/<int:reservation_id>/cancel/', ReservationCancelView.as_view()),
    path('reservations/<int:reservation_id>/no-show/', NoShowView.as_view()),
    path('check-in/', CheckInView.as_view()),
    path('finish-use/', FinishUseView.as_view()),
]
